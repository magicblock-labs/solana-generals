import { PublicKey, Transaction } from "@solana/web3.js";
import {
  AddEntity,
  InitializeComponent,
  createDelegateInstruction,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { WORLD_PDA, getComponentGame } from "./gamePrograms";

export async function gameCreate(engine: MagicBlockEngine) {
  /*
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
  */

  const entityPda = new PublicKey(
    "35r6ab7MAVhJwpbvf7eUcXeopSK5cQA775rCU9zCMZRP"
  );
  const componentPda = new PublicKey(
    "2e6fSpyGvMfLgFJQxbZ397MsmRDB4fNbFcx33GqFQmW5"
  );

  // Delegate the game component
  const delegateComponentInstruction = createDelegateInstruction({
    entity: entityPda,
    account: componentPda,
    ownerProgram: getComponentGame(engine).programId,
    payer: engine.getSessionPayer(),
  });
  await engine.processSessionTransaction(
    "DelegateComponent",
    new Transaction().add(delegateComponentInstruction),
    false
  );
  // Entity PDA for later use
  return entityPda;
}
