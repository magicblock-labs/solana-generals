import * as React from "react";
import { Idl, Program } from "@coral-xyz/anchor";
import {
  WalletContextState,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  AccountInfo,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletName } from "@solana/wallet-adapter-base";

const ENDPOINT_CHAIN_RPC = "https://api.testnet.solana.com";
const ENDPOINT_CHAIN_WS = "wss://api.testnet.solana.com";

const ENDPOINT_EPHEMERAL_RPC = "https://testnet.magicblock.app";
const ENDPOINT_EPHEMERAL_WS = "wss://testnet.magicblock.app:8900";

const SESSION_LOCAL_STORAGE = "magicblock-session-key";
const SESSION_MIN_LAMPORTS = 0.01 * 1_000_000_000;
const SESSION_MAX_LAMPORTS = 0.05 * 1_000_000_000;

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
  walletContext: WalletContextState;
  sessionKey: Keypair;
  sessionConfig: SessionConfig;

  constructor(
    walletContext: WalletContextState,
    sessionKey: Keypair,
    sessionConfig: SessionConfig
  ) {
    this.walletContext = walletContext;
    this.sessionKey = sessionKey;
    this.sessionConfig = sessionConfig;
  }

  getProgramChain<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, { connection: connectionChain });
  }
  getProgramEphemeral<T extends Idl>(idl: {}): Program<T> {
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
    await this.waitSignatureConfirmation(connectionChain, name, signature);
    return signature;
  }

  async processSessionChainTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    const signature = await connectionChain.sendTransaction(transaction, [
      this.sessionKey,
    ]);
    await this.waitSignatureConfirmation(connectionChain, name, signature);
    return signature;
  }

  async processSessionEphemeralTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    console.log("transaction sending", name); // TODO(vbrunet) - there should be a queue that helps guarantee the ordering of transactions
    const signature = await connectionEphemeral.sendTransaction(
      transaction,
      [this.sessionKey],
      { skipPreflight: true }
    );
    await this.waitSignatureConfirmation(connectionEphemeral, name, signature);
    return signature;
  }

  async waitSignatureConfirmation(
    connection: Connection,
    name: string,
    signature: string
  ): Promise<void> {
    console.log("transaction started:", name, signature);
    return new Promise((resolve, reject) => {
      connection.onSignature(signature, (result) => {
        console.log("transaction finalized:", name, signature, result.err);
        if (result.err) {
          reject(result.err);
        } else {
          resolve();
        }
      });
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

  subscribeToAccountInfo(
    address: PublicKey,
    onAccountChange: (accountInfo?: AccountInfo<Buffer>) => void
  ) {
    let cancelled = false;
    connectionChain
      .getAccountInfo(address)
      .then((accountInfo) => {
        if (!cancelled) {
          onAccountChange(accountInfo);
        }
      })
      .catch((error) => {
        console.log("Error fetching accountInfo", error);
        onAccountChange(undefined);
      });
    const subscription = connectionChain.onAccountChange(
      address,
      (accountInfo) => {
        onAccountChange(accountInfo);
      }
    );
    return () => {
      cancelled = true;
      connectionChain.removeAccountChangeListener(subscription);
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

const MagicBlockEngineContext = React.createContext<MagicBlockEngine>(
  {} as MagicBlockEngine
);

export function useMagicBlockEngine(): MagicBlockEngine {
  return React.useContext(MagicBlockEngineContext);
}

export function MagicBlockEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProvider wallets={[]} autoConnect>
      <MagicBlockEngineProviderInner>{children}</MagicBlockEngineProviderInner>
    </WalletProvider>
  );
}

function MagicBlockEngineProviderInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const walletContext = useWallet();

  const engine = React.useMemo(() => {
    let sessionKey;

    const sessionKeyString = localStorage.getItem(SESSION_LOCAL_STORAGE);
    if (sessionKeyString) {
      sessionKey = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(sessionKeyString))
      );
    } else {
      sessionKey = Keypair.generate();
      localStorage.setItem(
        SESSION_LOCAL_STORAGE,
        JSON.stringify(Array.from(sessionKey.secretKey))
      );
    }

    return new MagicBlockEngine(walletContext, sessionKey, {
      minLamports: SESSION_MIN_LAMPORTS,
      maxLamports: SESSION_MAX_LAMPORTS,
    });
  }, [walletContext]);

  return (
    <MagicBlockEngineContext.Provider value={engine}>
      {children}
    </MagicBlockEngineContext.Provider>
  );
}
