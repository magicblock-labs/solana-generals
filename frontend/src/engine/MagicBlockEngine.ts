import { Idl, Program } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  AccountInfo,
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletName } from "@solana/wallet-adapter-base";
import {
  createDelegateInstruction,
  DELEGATION_PROGRAM_ID,
} from "@magicblock-labs/ephemeral-rollups-sdk";

const ENDPOINT_CHAIN_RPC = "https://api.devnet.solana.com";
const ENDPOINT_CHAIN_WS = "wss://api.devnet.solana.com";

const _ENDPOINT_CHAIN_RPC = "http://127.0.0.1:7899";
const _ENDPOINT_CHAIN_WS = "ws://127.0.0.1:7900";

const ENDPOINT_EPHEM_RPC = "https://devnet.magicblock.app";
const ENDPOINT_EPHEM_WS = "wss://devnet.magicblock.app:8900";

const _ENDPOINT_EPHEM_RPC = "http://localhost:8899";
const _ENDPOINT_EPHEM_WS = "ws://localhost:8900";

const connectionChain = new Connection(ENDPOINT_CHAIN_RPC, {
  wsEndpoint: ENDPOINT_CHAIN_WS,
});
const connectionEphem = new Connection(ENDPOINT_EPHEM_RPC, {
  wsEndpoint: ENDPOINT_EPHEM_WS,
});

interface SessionConfig {
  minLamports: number;
  maxLamports: number;
}

interface WalletAdapter {
  name: string;
  icon: string;
}

export class MagicBlockEngine {
  private walletContext: WalletContextState;
  private sessionKey: Keypair;
  private sessionConfig: SessionConfig;

  private ephemeralKey: Keypair;

  constructor(
    walletContext: WalletContextState,
    sessionKey: Keypair,
    sessionConfig: SessionConfig
  ) {
    this.walletContext = walletContext;
    this.sessionKey = sessionKey;
    this.sessionConfig = sessionConfig;

    this.ephemeralKey = Keypair.fromSeed(this.sessionKey.publicKey.toBuffer()); // TODO - this is bad
  }

  getProgramOnChain<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, { connection: connectionChain });
  }
  getProgramOnEphem<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, { connection: connectionEphem });
  }

  getConnectionChain(): Connection {
    return connectionChain;
  }
  getConnectionEphem(): Connection {
    return connectionEphem;
  }

  getChainKey(): PublicKey {
    return this.walletContext.publicKey;
  }
  getEphemKey(): PublicKey {
    return this.ephemeralKey.publicKey;
  }

  getWalletConnected() {
    return this.walletContext.connected;
  }
  getWalletConnecting() {
    return this.walletContext.connecting;
  }

  async processWalletTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    console.log(name, "sending");
    const signature = await this.walletContext.sendTransaction(
      transaction,
      connectionChain
    );
    await this.waitSignatureConfirmation(
      name,
      signature,
      connectionChain,
      "confirmed"
    );
    return signature;
  }

  async processSessionChainTransaction(
    name: string,
    transaction: Transaction,
    extraSigner?: Keypair
  ): Promise<string> {
    console.log(name, "sending");
    const signature = await connectionChain.sendTransaction(
      transaction,
      extraSigner ? [this.sessionKey, extraSigner] : [this.sessionKey],
      { skipPreflight: true }
    );
    await this.waitSignatureConfirmation(
      name,
      signature,
      connectionChain,
      "confirmed"
    );
    return signature;
  }

  async ensureEphemKeyDelegated() {
    const chainAccountInfo = await this.getChainAccountInfo(
      this.ephemeralKey.publicKey
    );
    const ephemAccountInfo = await this.getEphemAccountInfo(
      this.ephemeralKey.publicKey
    );
    if (ephemAccountInfo) {
      console.log(
        "ephemeralKey is funded:",
        this.ephemeralKey.publicKey.toBase58(),
        "chain lamports:",
        chainAccountInfo.lamports,
        "ephem lamports:",
        ephemAccountInfo.lamports
      );
      return;
    }
    console.log(
      "ephemeralKey needs to be delegated:",
      this.ephemeralKey.publicKey.toBase58()
    );
    const rentExemptionAmount =
      await connectionEphem.getMinimumBalanceForRentExemption(0);
    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.sessionKey.publicKey,
        newAccountPubkey: this.ephemeralKey.publicKey,
        lamports: rentExemptionAmount,
        space: 0,
        programId: new PublicKey(DELEGATION_PROGRAM_ID),
      }),
      createDelegateInstruction({
        payer: this.sessionKey.publicKey,
        delegateAccount: this.ephemeralKey.publicKey,
        ownerProgram: SystemProgram.programId,
      })
    );
    this.processSessionChainTransaction(
      "EphemKey delegation",
      tx,
      this.ephemeralKey
    );
  }

  async processSessionEphemTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    await this.ensureEphemKeyDelegated();
    console.log(name, "sending");
    transaction.compileMessage;
    const signature = await connectionEphem.sendTransaction(
      transaction,
      [this.ephemeralKey],
      { skipPreflight: true }
    );
    await this.waitSignatureConfirmation(
      name,
      signature,
      connectionEphem,
      "finalized"
    );
    return signature;
  }

  async waitSignatureConfirmation(
    name: string,
    signature: string,
    connection: Connection,
    commitment: Commitment
  ): Promise<void> {
    console.log(name, "sent", signature);
    return new Promise((resolve, reject) => {
      connection.onSignature(
        signature,
        (result) => {
          console.log(name, commitment, signature, result.err);
          if (result.err) {
            this.debugError(name, signature, connection);
            reject(result.err);
          } else {
            resolve();
          }
        },
        commitment
      );
    });
  }

  async debugError(name: string, signature: string, connection: Connection) {
    const transaction = await connection.getParsedTransaction(signature);
    console.log("debugError", name, signature, transaction);
  }

  async getSessionFundingMissingLamports() {
    const accountInfo = await connectionChain.getAccountInfo(
      this.getSessionPayer()
    );
    const currentLamports = accountInfo?.lamports ?? 0;
    if (currentLamports < this.sessionConfig.minLamports) {
      return this.sessionConfig.maxLamports - currentLamports;
    }
    return 0;
  }

  async fundSessionFromAirdrop() {
    const missingLamports = await this.getSessionFundingMissingLamports();
    if (missingLamports > 0) {
      await connectionChain.requestAirdrop(
        this.sessionKey.publicKey,
        missingLamports
      );
    }
  }

  async fundSessionFromWallet() {
    const missingLamports = await this.getSessionFundingMissingLamports();
    if (missingLamports > 0) {
      await this.processWalletTransaction(
        "FundSessionFromWallet",
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.getChainKey(),
            toPubkey: this.getSessionPayer(),
            lamports: missingLamports,
          })
        )
      );
    }
  }

  getChainAccountInfo(address: PublicKey) {
    return connectionChain.getAccountInfo(address);
  }
  getEphemAccountInfo(address: PublicKey) {
    return connectionEphem.getAccountInfo(address);
  }

  subscribeToChainAccountInfo(
    address: PublicKey,
    onAccountChange: (accountInfo?: AccountInfo<Buffer>) => void
  ) {
    return this.subscribeToAccountInfo(
      connectionChain,
      address,
      onAccountChange
    );
  }
  subscribeToEphemAccountInfo(
    address: PublicKey,
    onAccountChange: (accountInfo?: AccountInfo<Buffer>) => void
  ) {
    return this.subscribeToAccountInfo(
      connectionEphem,
      address,
      onAccountChange
    );
  }

  subscribeToAccountInfo(
    connection: Connection,
    address: PublicKey,
    onAccountChange: (accountInfo?: AccountInfo<Buffer>) => void
  ) {
    let ignoreFetch = false;
    connection.getAccountInfo(address).then(
      (accountInfo) => {
        if (ignoreFetch) {
          return;
        }
        onAccountChange(accountInfo);
      },
      (error) => {
        console.log("Error fetching accountInfo", error);
        onAccountChange(undefined);
      }
    );
    const subscription = connection.onAccountChange(address, (accountInfo) => {
      ignoreFetch = true;
      onAccountChange(accountInfo);
    });
    return () => {
      ignoreFetch = true;
      connection.removeAccountChangeListener(subscription);
    };
  }

  listWalletAdapters(): WalletAdapter[] {
    return this.walletContext.wallets.map((wallet) => {
      return {
        name: wallet.adapter.name,
        icon: wallet.adapter.icon,
      };
    });
  }

  selectWalletAdapter(wallet: WalletAdapter | null) {
    if (wallet) {
      return this.walletContext.select(wallet.name as WalletName);
    } else {
      return this.walletContext.disconnect();
    }
  }

  getSessionMinLamports(): number {
    return this.sessionConfig.minLamports;
  }

  getSessionMaximalLamports(): number {
    return this.sessionConfig.maxLamports;
  }
}
