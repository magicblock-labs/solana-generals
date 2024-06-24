import { PublicKey } from "@solana/web3.js";
import { AddEntity, InitializeComponent } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame } from "./gamePrograms";

const WORLD_PDA = new PublicKey("12MArv4fDwYMJNFXtPjQWuWJaVmKCqLyqz8fZmDQArpd");

export async function gameCreate(engine: MagicBlockEngine) {
  // Create a new Entity
  const addEntity = await AddEntity({
    connection: engine.getConnection(),
    payer: engine.getSessionPayer(),
    world: WORLD_PDA,
  });
  console.log(
    "addEntity",
    addEntity.entityPda.toBase58(),
    await engine.processSessionTransaction(addEntity.transaction)
  );

  // Create a new Component
  const initializeComponent = await InitializeComponent({
    payer: engine.getSessionPayer(),
    entity: addEntity.entityPda,
    componentId: getComponentGame(engine).programId,
  });
  console.log(
    "initializeComponent",
    initializeComponent.componentPda.toBase58(),
    await engine.processSessionTransaction(initializeComponent.transaction)
  );

  // Done
  return addEntity.entityPda;
}
