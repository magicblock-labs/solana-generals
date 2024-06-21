import { Transaction } from "@solana/web3.js";
import {
  InitializeNewWorld,
  AddEntity,
  InitializeComponent,
  FindWorldRegistryPda,
  createInitializeRegistryInstruction,
} from "@magicblock-labs/bolt-sdk";

import { Generals } from "./Generals";

export async function gameCreate(generals: Generals) {
  const connection = generals.getConnection();
  const payer = generals.getPayer();

  // TODO(vbrunet) - predeploy a registry/world PDA
  // Registry
  const registryPda = FindWorldRegistryPda();
  const initializeRegistryIx = createInitializeRegistryInstruction({
    registry: registryPda,
    payer: payer,
  });
  console.log(
    "initializeRegistry",
    await generals.processTransaction(
      new Transaction().add(initializeRegistryIx)
    )
  );
  console.log("registryPda", registryPda.toBase58());

  // World
  const initializeNewWorld = await InitializeNewWorld({
    connection: connection,
    payer: payer,
  });
  console.log(
    "initializeNewWorld",
    await generals.processTransaction(initializeNewWorld.transaction)
  );
  console.log(
    "initializeNewWorld.worldPda",
    initializeNewWorld.worldPda.toBase58()
  );

  // Entity
  const addEntity = await AddEntity({
    connection: connection,
    payer: payer,
    world: initializeNewWorld.worldPda,
  });
  console.log(
    "addEntity",
    await generals.processTransaction(addEntity.transaction)
  );
  console.log("addEntity.entityPda", addEntity.entityPda.toBase58());

  // Component
  const initializeComponent = await InitializeComponent({
    payer: payer,
    entity: addEntity.entityPda,
    componentId: generals.getComponentGame().programId,
  });
  console.log(
    "initializeComponent",
    await generals.processTransaction(initializeComponent.transaction)
  );

  console.log(
    "initializeComponent.componentPda",
    initializeComponent.componentPda.toBase58()
  );

  // Done
  return addEntity.entityPda;
}
