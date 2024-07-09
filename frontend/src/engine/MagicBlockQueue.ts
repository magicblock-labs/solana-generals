import { Transaction } from "@solana/web3.js";

import { MagicBlockEngine } from "./MagicBlockEngine";

export class MagicBlockQueue {
  private engine: MagicBlockEngine;
  private last: Promise<string>;

  constructor(engine: MagicBlockEngine) {
    this.engine = engine;
    this.last = new Promise((resolve) => setTimeout(() => resolve("")));
  }

  getSessionPayer() {
    return this.engine.getSessionPayer();
  }

  async processSessionEphemeralTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    const engine = this.engine;
    const last = this.last;
    const next = (async function () {
      try {
        await last;
      } catch (error) {}
      return await engine.processSessionEphemeralTransaction(name, transaction);
    })();
    this.last = next;
    return next;
  }
}
