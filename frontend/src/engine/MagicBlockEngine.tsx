import * as React from "react";
import { Idl, Program } from "@coral-xyz/anchor";
import {
  ConnectionContextState,
  Wallet,
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
  clusterApiUrl,
} from "@solana/web3.js";

const ENDPOINT_RPC = "https://devnet.magicblock.app";
const ENDPOINT_WS = "wss://devnet.magicblock.app:8900";

const ephemeral = new Connection(ENDPOINT_RPC, {
  wsEndpoint: ENDPOINT_WS,
});

const SESSION_KEY_LOCAL_STORAGE = "magicblock-session-key";

const SESSION_KEY_MIN_LAMPORTS = 0.01 * 1_000_000_000;
const SESSION_KEY_MAX_LAMPORTS = 0.05 * 1_000_000_000;

const TRANSACTION_COST_LAMPORTS = 5000;

export class MagicBlockEngine {
  connectionContext: ConnectionContextState;
  walletContext: WalletContextState;
  sessionKey: Keypair;
  sessionMinimalLamports: number;
  sessionMaximalLamports: number;

  constructor(
    connectionContext: ConnectionContextState,
    walletContext: WalletContextState,
    sessionKey: Keypair,
    sessionMinimalLamports: number = SESSION_KEY_MIN_LAMPORTS,
    sessionMaximalLamports: number = SESSION_KEY_MAX_LAMPORTS
  ) {
    this.connectionContext = connectionContext;
    this.walletContext = walletContext;
    this.sessionKey = sessionKey;
    this.sessionMinimalLamports = sessionMinimalLamports;
    this.sessionMaximalLamports = sessionMaximalLamports;
  }

  getProgram<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, this.connectionContext);
  }

  getConnection(): Connection {
    return this.connectionContext.connection;
  }

  getConnected() {
    return this.walletContext.connected;
  }

  getConnecting() {
    return this.walletContext.connecting;
  }

  getWalletPayer(): PublicKey {
    return this.walletContext.publicKey;
  }

  getSessionPayer(): PublicKey {
    return this.sessionKey.publicKey;
  }

  async isNewAccount(key: PublicKey): Promise<boolean> {
    const accountInfo =
      await this.connectionContext.connection.getAccountInfo(key);
    return accountInfo == null;
  }

  async processWalletTransaction(transaction: Transaction): Promise<string> {
    const signature = await this.walletContext.sendTransaction(
      transaction,
      this.connectionContext.connection
    );
    await this.waitSignatureConfirmation(
      this.connectionContext.connection,
      signature
    );
    return signature;
  }

  async processSessionTransaction(
    transaction: Transaction,
    routedToEphemeral: boolean
  ): Promise<string> {
    const connection = routedToEphemeral
      ? ephemeral
      : this.connectionContext.connection;
    const signature = await connection.sendTransaction(transaction, [
      this.sessionKey,
    ]);
    await this.waitSignatureConfirmation(connection, signature);
    return signature;
  }

  async waitSignatureConfirmation(
    connection: Connection,
    signature: string
  ): Promise<void> {
    console.log("transaction started:", signature);
    return new Promise((resolve, reject) => {
      const subscription = connection.onSignature(signature, (result) => {
        connection.removeSignatureListener(subscription);
        console.log("transaction result:", signature, result);
        if (result.err) {
          reject(result.err);
        } else {
          resolve();
        }
      });
    });
  }

  async fundSession() {
    const accountInfo = await this.connectionContext.connection.getAccountInfo(
      this.getSessionPayer()
    );
    if (!accountInfo || accountInfo.lamports < this.sessionMinimalLamports) {
      const existingLamports = accountInfo?.lamports ?? 0;
      const missingLamports = this.sessionMaximalLamports - existingLamports;
      console.log("fundSession.existingLamports", existingLamports);
      console.log("fundSession.missingLamports", missingLamports);
      await this.processWalletTransaction(
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
    const accountInfo = await this.connectionContext.connection.getAccountInfo(
      this.getSessionPayer()
    );
    if (accountInfo && accountInfo.lamports > 0) {
      const transferableLamports =
        accountInfo.lamports - TRANSACTION_COST_LAMPORTS;
      await this.processSessionTransaction(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: this.getSessionPayer(),
            toPubkey: this.getWalletPayer(),
            lamports: transferableLamports,
          })
        ),
        false
      );
    }
  }

  listeToAccountInfo(
    address: PublicKey,
    onAccountChange: (accountInfo?: AccountInfo<Buffer>) => void
  ) {
    let cancelled = false;
    this.connectionContext.connection
      .getAccountInfo(address)
      .then((accountInfo) => {
        if (!cancelled) {
          onAccountChange(accountInfo);
        }
      });
    const subscription = this.connectionContext.connection.onAccountChange(
      address,
      (accountInfo) => {
        onAccountChange(accountInfo);
      }
    );
    return () => {
      cancelled = true;
      this.connectionContext.connection.removeAccountChangeListener(
        subscription
      );
    };
  }

  listWallets(): Wallet[] {
    return this.walletContext.wallets;
  }

  selectWallet(wallet: Wallet | null) {
    if (wallet) {
      return this.walletContext.select(wallet.adapter.name);
    } else {
      return this.walletContext.disconnect();
    }
  }

  getSessionMinimalLamports(): number {
    return this.sessionMinimalLamports;
  }

  getSessionMaximalLamports(): number {
    return this.sessionMaximalLamports;
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

    /*
    const connectionContext = {
      connection: new Connection(ENDPOINT_RPC, {
        wsEndpoint: ENDPOINT_WSS,
      }),
    };
    */
    const endpoint = clusterApiUrl("devnet");
    console.log("endpoint", endpoint);
    const connectionContext = {
      connection: new Connection(endpoint),
    };

    const sessionKeyString = localStorage.getItem(SESSION_KEY_LOCAL_STORAGE);
    if (sessionKeyString) {
      sessionKey = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(sessionKeyString))
      );
    } else {
      sessionKey = Keypair.generate();
      localStorage.setItem(
        SESSION_KEY_LOCAL_STORAGE,
        JSON.stringify(Array.from(sessionKey.secretKey))
      );
    }

    return new MagicBlockEngine(connectionContext, walletContext, sessionKey);
  }, [walletContext]);

  return (
    <MagicBlockEngineContext.Provider value={engine}>
      {children}
    </MagicBlockEngineContext.Provider>
  );
}
