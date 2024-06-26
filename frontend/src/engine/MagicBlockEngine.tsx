import * as React from "react";
import { Idl, Program } from "@coral-xyz/anchor";
import {
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
} from "@solana/web3.js";

const ENDPOINT_CHAIN_RPC = "https://api.devnet.solana.com";
const ENDPOINT_CHAIN_WS = "ws://api.devnet.solana.com";

const ENDPOINT_EPHEMERAL_RPC = "https://devnet.magicblock.app";
const ENDPOINT_EPHEMERAL_WS = "wss://devnet.magicblock.app:8900";

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

  getProgram<T extends Idl>(idl: {}): Program<T> {
    return new Program<T>(idl as T, { connection: connectionChain });
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

  async processSessionTransaction(
    name: string,
    transaction: Transaction,
    routedToEphemeral: boolean // TODO(vbrunet) - clean that up, it should be automatic
  ): Promise<string> {
    const connection = routedToEphemeral
      ? connectionEphemeral
      : connectionChain;
    const signature = await connection.sendTransaction(transaction, [
      this.sessionKey,
    ]);
    await this.waitSignatureConfirmation(connection, name, signature);
    return signature;
  }

  async waitSignatureConfirmation(
    connection: Connection,
    name: string,
    signature: string
  ): Promise<void> {
    console.log("transaction started:", name, signature);
    return new Promise((resolve, reject) => {
      const subscription = connection.onSignature(signature, (result) => {
        connection.removeSignatureListener(subscription);
        console.log("transaction finilized:", name, signature, result.err);
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
      await this.processSessionTransaction(
        "DefundSession",
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
    connectionChain.getAccountInfo(address).then((accountInfo) => {
      if (!cancelled) {
        onAccountChange(accountInfo);
      }
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
