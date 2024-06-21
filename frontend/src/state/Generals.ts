import { Transaction } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import {
  ConnectionContextState,
  WalletContextState,
} from "@solana/wallet-adapter-react";

import { Game } from "../data/types/game";
import { Generate } from "../data/types/generate";

import * as GameIdl from "../data/idl/game.json";
import * as GenerateIdl from "../data/idl/generate.json";

export class Generals {
  connectionContext: ConnectionContextState;
  walletContext: WalletContextState;

  componentGame: Program<Game>;
  systemGenerate: Program<Generate>;

  constructor(
    connectionContext: ConnectionContextState,
    walletContext: WalletContextState
  ) {
    this.connectionContext = connectionContext;
    this.walletContext = walletContext;
    this.componentGame = new Program<Game>(GameIdl as Game, connectionContext);
    this.systemGenerate = new Program<Generate>(
      GenerateIdl as Generate,
      connectionContext
    );
  }

  getConnection() {
    return this.connectionContext.connection;
  }

  getPayer() {
    return this.walletContext.publicKey;
  }

  getComponentGame() {
    return this.componentGame;
  }

  getSystemGenerate() {
    return this.systemGenerate;
  }

  async processTransaction(transaction: Transaction) {
    return await this.walletContext.sendTransaction(
      transaction,
      this.connectionContext.connection
    );
  }
}
