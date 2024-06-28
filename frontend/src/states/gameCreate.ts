import { Transaction } from "@solana/web3.js";
import {
  AddEntity,
  InitializeComponent,
  createDelegateInstruction,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { WORLD_PDA, getComponentGame } from "./gamePrograms";

import { gameSystemGenerate } from "./gameSystemGenerate";

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
  // Initialize the game component
  const initializeComponent = await InitializeComponent({
    payer: engine.getSessionPayer(),
    entity: addEntity.entityPda,
    componentId: getComponentGame(engine).programId,
  });
  await engine.processSessionTransaction(
    "InitializeComponent",
    initializeComponent.transaction,
    false
  );
  // Delegate the game component
  const delegateComponentInstruction = createDelegateInstruction({
    entity: addEntity.entityPda,
    account: initializeComponent.componentPda,
    ownerProgram: getComponentGame(engine).programId,
    payer: engine.getSessionPayer(),
  });
  await engine.processSessionTransaction(
    "DelegateComponent",
    new Transaction().add(delegateComponentInstruction),
    false
  );
  // Generate the map (this should warm up the ephemeral rollup)
  await gameSystemGenerate(engine, addEntity.entityPda);
  // Entity PDA for later use
  return addEntity.entityPda;
}
