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
    addEntity.transaction,
    "confirmed"
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
    initializeComponent.transaction,
    "confirmed"
  );
  console.log("Component ready", initializeComponent.componentPda.toBase58());
  // Delegate the game component
  log("Delegating to Ephemeral rollups");
  const delegateComponentInstruction = createDelegateInstruction({
    entity: addEntity.entityPda,
    account: initializeComponent.componentPda,
    ownerProgram: getComponentGame(engine).programId,
    payer: engine.getSessionPayer(),
  });
  await engine.processSessionChainTransaction(
    "DelegateComponent",
    new Transaction().add(delegateComponentInstruction),
    "finalized"
  );

  log("Await some times");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Generate the game
  log("Generate the game");
  await gameSystemGenerate(engine, addEntity.entityPda);
  // Entity PDA for later use
  log("Game is ready!");
  return addEntity.entityPda;
}
