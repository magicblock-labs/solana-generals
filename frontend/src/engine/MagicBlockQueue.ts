import { Transaction } from "@solana/web3.js";

import { MagicBlockEngine } from "./MagicBlockEngine";

export class MagicBlockQueue {
  private engine: MagicBlockEngine;
  private timeout: number;
  private last?: Promise<string>;

  constructor(engine: MagicBlockEngine, timeout: number) {
    this.engine = engine;
    this.timeout = timeout;
    this.last = undefined;
  }

  getSessionPayer() {
    return this.engine.getSessionPayer();
  }

  async processSessionEphemTransaction(
    name: string,
    transaction: Transaction
  ): Promise<string> {
    const engine = this.engine;
    const last = this.last;
    const timeout = this.timeout;

    const next = (async function () {
      try {
        if (last !== undefined) {
          await last;
        }
      } catch (error) {
        // The error should be handled by another awaiter (from the return)
      }
      const expiration = new Promise<string>((resolve) =>
        setTimeout(() => resolve(""), timeout)
      );
      const execution = engine.processSessionEphemTransaction(
        name,
        transaction
      );
      return await Promise.race([expiration, execution]);
    })();

    this.last = next;
    return next;
  }
}
