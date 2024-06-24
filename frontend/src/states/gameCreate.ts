import { PublicKey, Transaction } from "@solana/web3.js";
import {
  AddEntity,
  InitializeComponent,
  createDelegateInstruction,
} from "@magicblock-labs/bolt-sdk";

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
    await engine.processSessionTransaction(addEntity.transaction, false)
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
    await engine.processSessionTransaction(
      initializeComponent.transaction,
      false
    )
  );

  // Delegate the new component
  const delegateComponentInstruction = createDelegateInstruction({
    entity: addEntity.entityPda,
    account: initializeComponent.componentPda,
    ownerProgram: getComponentGame(engine).programId,
    payer: engine.getSessionPayer(),
  });
  console.log(
    "delegateComponent",
    await engine.processSessionTransaction(
      new Transaction().add(delegateComponentInstruction),
      false
    )
  );

  // Done
  return addEntity.entityPda;
}
