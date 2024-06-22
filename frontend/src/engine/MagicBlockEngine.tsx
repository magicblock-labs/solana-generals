import * as React from "react";
import { Idl, Program } from "@coral-xyz/anchor";
import {
  ConnectionContextState,
  WalletContextState,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const LOCAL_STORAGE_KEY = "magicblock-session-key";

export class MagicBlockEngine {
  connectionContext: ConnectionContextState;
  walletContext: WalletContextState;
  sessionKey: Keypair;

  constructor(
    connectionContext: ConnectionContextState,
    walletContext: WalletContextState,
    sessionKey: Keypair
  ) {
    this.connectionContext = connectionContext;
    this.walletContext = walletContext;
    this.sessionKey = sessionKey;
  }

  getConnected() {
    return this.walletContext.connected;
  }

  getProgram<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, this.connectionContext);
  }

  getConnection(): Connection {
    return this.connectionContext.connection;
  }

  getWalletPayer(): PublicKey {
    return this.walletContext.publicKey;
  }

  getSessionPayer(): PublicKey {
    return this.sessionKey.publicKey;
  }

  async isLiveAccount(key: PublicKey): Promise<boolean> {
    const accountInfo =
      await this.connectionContext.connection.getAccountInfo(key);
    return accountInfo != null;
  }

  async isNewAccount(key: PublicKey): Promise<boolean> {
    const accountInfo =
      await this.connectionContext.connection.getAccountInfo(key);
    return accountInfo == null;
  }

  async getSlot() {
    return this.connectionContext.connection.getSlot();
  }

  async processWalletTransaction(transaction: Transaction): Promise<string> {
    const signature = await this.walletContext.sendTransaction(
      transaction,
      this.connectionContext.connection
    );
    await this.waitSignatureConfirmation(signature);
    return signature;
  }

  async processSessionTransaction(transaction: Transaction): Promise<string> {
    const signature = await this.connectionContext.connection.sendTransaction(
      transaction,
      [this.sessionKey]
    );
    await this.waitSignatureConfirmation(signature);
    return signature;
  }

  async waitSignatureConfirmation(signature: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscription = this.connectionContext.connection.onSignature(
        signature,
        (result) => {
          this.connectionContext.connection.removeSignatureListener(
            subscription
          );
          console.log("transaction result:", signature, result);
          if (result.err) {
            reject(result.err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async fundSession(
    minimalLamports: number = 0.01 * 1_000_000_000,
    maximalLamports: number = 0.02 * 1_000_000_000
  ): Promise<void> {
    const accountInfo = await this.connectionContext.connection.getAccountInfo(
      this.getSessionPayer()
    );
    if (!accountInfo || accountInfo.lamports < minimalLamports) {
      const existingLamports = accountInfo?.lamports ?? 0;
      const missingLamports = maximalLamports - existingLamports;
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
      const transferableLamports = accountInfo.lamports - 5_000;
      await this.processSessionTransaction(
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
  const connection = useConnection();
  const wallet = useWallet();

  const engine = React.useMemo(() => {
    let sessionKey;

    const sessionKeyString = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (sessionKeyString) {
      sessionKey = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(sessionKeyString))
      );
    } else {
      sessionKey = Keypair.generate();
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(Array.from(sessionKey.secretKey))
      );
    }

    return new MagicBlockEngine(connection, wallet, sessionKey);
  }, [connection, wallet]);

  return (
    <MagicBlockEngineContext.Provider value={engine}>
      {children}
    </MagicBlockEngineContext.Provider>
  );
}
