import { Transaction } from "@solana/web3.js";
import {
  AddEntity,
  InitializeComponent,
  createDelegateInstruction,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { COMPONENT_GAME_PROGRAM_ID, WORLD_PDA } from "./gamePrograms";
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
    addEntity.transaction,
    "confirmed"
  );
  // Initialize the game component
  log("Initializing a new component");
  const initializeComponent = await InitializeComponent({
    payer: engine.getSessionPayer(),
    entity: addEntity.entityPda,
    componentId: COMPONENT_GAME_PROGRAM_ID,
  });
  await engine.processSessionChainTransaction(
    "InitializeComponent",
    initializeComponent.transaction,
    "confirmed"
  );
  // Delegate the game component
  log("Delegating to Ephemeral rollups");
  const delegateComponentInstruction = createDelegateInstruction({
    entity: addEntity.entityPda,
    account: initializeComponent.componentPda,
    ownerProgram: COMPONENT_GAME_PROGRAM_ID,
    payer: engine.getSessionPayer(),
  });
  await engine.processSessionChainTransaction(
    "DelegateComponent",
    new Transaction().add(delegateComponentInstruction),
    "finalized"
  );
  // Generate the game
  log("Generate the game");
  await gameSystemGenerate(engine, addEntity.entityPda);
  // Entity PDA for later use
  log("Game is ready!");
  return addEntity.entityPda;
}
