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
      const timeout = new Promise<string>((resolve) =>
        setTimeout(() => resolve(""), 5000)
      );
      const process = engine.processSessionEphemeralTransaction(
        name,
        transaction
      );
      return await Promise.race([timeout, process]);
    })();
    this.last = next;
    return next;
  }
}
