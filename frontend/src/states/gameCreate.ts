import { PublicKey } from "@solana/web3.js";
import { AddEntity } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

const WORLD_PDA = new PublicKey("12MArv4fDwYMJNFXtPjQWuWJaVmKCqLyqz8fZmDQArpd");

export async function gameCreate(engine: MagicBlockEngine) {
  // Create a new Entity
  const addEntity = await AddEntity({
    connection: engine.getConnectionChain(),
    payer: engine.getSessionPayer(),
    world: WORLD_PDA,
  });
  await engine.processSessionTransaction(
    "AddEntity",
    addEntity.transaction,
    false
  );
  // Entity PDA for later use
  return addEntity.entityPda;
}
