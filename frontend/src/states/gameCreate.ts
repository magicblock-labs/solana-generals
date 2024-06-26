import { Transaction } from "@solana/web3.js";
import {
  AddEntity,
  InitializeComponent,
  createDelegateInstruction,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { WORLD_PDA, getComponentGame } from "./gamePrograms";

import { gameSystemGenerate } from "./gameSystemGenerate";

export async function gameCreate(
  engine: MagicBlockEngine,
  log: (log: string) => void
) {
  // Create a new Entity
  log("Creating a new entity");
  const addEntity = await AddEntity({
    connection: engine.getConnectionChain(),
    payer: engine.getSessionPayer(),
    world: WORLD_PDA,
  });
  await engine.processSessionChainTransaction(
    "AddEntity",
    addEntity.transaction
  );
  // Initialize the game component
  log("Initializing a new component");
  const initializeComponent = await InitializeComponent({
    payer: engine.getSessionPayer(),
    entity: addEntity.entityPda,
    componentId: getComponentGame(engine).programId,
  });
  await engine.processSessionChainTransaction(
    "InitializeComponent",
    initializeComponent.transaction
  );
  // Delegate the game component
  log("Delegating the component to Ephemeral rollups");
  const delegateComponentInstruction = createDelegateInstruction({
    entity: addEntity.entityPda,
    account: initializeComponent.componentPda,
    ownerProgram: getComponentGame(engine).programId,
    payer: engine.getSessionPayer(),
  });
  await engine.processSessionChainTransaction(
    "DelegateComponent",
    new Transaction().add(delegateComponentInstruction)
  );
  // Generate the map (this should warm up the ephemeral rollup)
  log("Generate the game's map");
  await gameSystemGenerate(engine, addEntity.entityPda);
  // Entity PDA for later use
  log("Game is ready!");
  return addEntity.entityPda;
}
