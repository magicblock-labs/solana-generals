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

const ENDPOINT_CHAIN_RPC = "https://api.devnet.solana.com";
const ENDPOINT_CHAIN_WS = "wss://api.devnet.solana.com";

const ENDPOINT_EPHEMERAL_RPC = "https://devnet.magicblock.app";
const ENDPOINT_EPHEMERAL_WS = "wss://devnet.magicblock.app:8900";

const TRANSACTION_COST_LAMPORTS = 5000;

const connectionEphemeral = new Connection(ENDPOINT_EPHEMERAL_RPC, {
  wsEndpoint: ENDPOINT_EPHEMERAL_WS,
});
const connectionChain = new Connection(ENDPOINT_CHAIN_RPC, {
  wsEndpoint: ENDPOINT_CHAIN_WS,
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

  constructor(
    walletContext: WalletContextState,
    sessionKey: Keypair,
    sessionConfig: SessionConfig
  ) {
    this.walletContext = walletContext;
    this.sessionKey = sessionKey;
    this.sessionConfig = sessionConfig;
  }

  getProgramOnChain<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, { connection: connectionChain });
  }
  getProgramOnEphemeral<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, { connection: connectionEphemeral });
  }

  getConnectionChain(): Connection {
    return connectionChain;
  }
  getConnectionEphemeral(): Connection {
    return connectionEphemeral;
  }

  getWalletConnected() {
    return this.walletContext.connected;
  }
  getWalletConnecting() {
    return this.walletContext.connecting;
  }

  getWalletPayer(): PublicKey {
    return this.walletContext.publicKey;
  }

  getSessionPayer(): PublicKey {
    return this.sessionKey.publicKey;
  }

  async processWalletTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    const signature = await this.walletContext.sendTransaction(
      transaction,
      connectionChain
    );
    await this.waitSignatureConfirmation(
      name,
      signature,
      connectionChain,
      "finalized"
    );
    return signature;
  }

  async processSessionChainTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    const signature = await connectionChain.sendTransaction(
      transaction,
      [this.sessionKey]
      //{ skipPreflight: true }
    );
    await this.waitSignatureConfirmation(
      name,
      signature,
      connectionChain,
      "finalized"
    );
    return signature;
  }

  async processSessionEphemeralTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    const signature = await connectionEphemeral.sendTransaction(
      transaction,
      [this.sessionKey]
      //{ skipPreflight: true }
    );
    await this.waitSignatureConfirmation(
      name,
      signature,
      connectionEphemeral,
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
    console.log(name, "sent");
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
    connection.getParsedTransaction(signature).then((transaction: any) => {
      console.log("debugError", name, signature, transaction);
    });
  }

  async fundSession() {
    const accountInfo = await connectionChain.getAccountInfo(
      this.getSessionPayer()
    );
    if (!accountInfo || accountInfo.lamports < this.sessionConfig.minLamports) {
      const existingLamports = accountInfo?.lamports ?? 0;
      const missingLamports = this.sessionConfig.maxLamports - existingLamports;
      console.log("fundSession.existingLamports", existingLamports);
      console.log("fundSession.missingLamports", missingLamports);
      await this.processWalletTransaction(
        "FundSession",
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.getWalletPayer(),
            toPubkey: this.getSessionPayer(),
            lamports: missingLamports,
          })
        )
      );
    }
  }

  async defundSession() {
    const accountInfo = await connectionChain.getAccountInfo(
      this.getSessionPayer()
    );
    if (accountInfo && accountInfo.lamports > 0) {
      const transferableLamports =
        accountInfo.lamports - TRANSACTION_COST_LAMPORTS;
      await this.processSessionChainTransaction(
        "DefundSession",
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.getSessionPayer(),
            toPubkey: this.getWalletPayer(),
            lamports: transferableLamports,
          })
        )
      );
    }
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

  subscribeToEphemeralAccountInfo(
    address: PublicKey,
    onAccountChange: (accountInfo?: AccountInfo<Buffer>) => void
  ) {
    return this.subscribeToAccountInfo(
      connectionEphemeral,
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