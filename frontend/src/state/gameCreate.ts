import { Transaction } from "@solana/web3.js";
import {
  InitializeNewWorld,
  AddEntity,
  InitializeComponent,
  FindWorldRegistryPda,
  createInitializeRegistryInstruction,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame } from "./gamePrograms";

export async function gameCreate(engine: MagicBlockEngine) {
  const connection = engine.getConnection();
  const payer = engine.getSessionPayer();

  await engine.fundSession();

  // TODO(vbrunet) - predeploy a registry/world PDA
  // Registry
  const registryPda = FindWorldRegistryPda();
  if (await engine.isNewAccount(registryPda)) {
    const initializeRegistryIx = createInitializeRegistryInstruction({
      registry: registryPda,
      payer: payer,
    });
    console.log(
      "initializeRegistry",
      await engine.processSessionTransaction(
        new Transaction().add(initializeRegistryIx)
      )
    );
  }
  console.log("registryPda", registryPda.toBase58());

  // World
  const initializeNewWorld = await InitializeNewWorld({
    connection: connection,
    payer: payer,
  });
  console.log(
    "initializeNewWorld.worldId",
    initializeNewWorld.worldId.toString()
  );
  if (await engine.isNewAccount(initializeNewWorld.worldPda)) {
    console.log(
      "initializeNewWorld",
      await engine.processSessionTransaction(initializeNewWorld.transaction)
    );
  }
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
  if (await engine.isNewAccount(addEntity.entityPda)) {
    console.log(
      "addEntity",
      await engine.processSessionTransaction(addEntity.transaction)
    );
  }
  console.log("addEntity.entityPda", addEntity.entityPda.toBase58());

  // Component
  const initializeComponent = await InitializeComponent({
    payer: payer,
    entity: addEntity.entityPda,
    componentId: getComponentGame(engine).programId,
  });
  if (await engine.isNewAccount(initializeComponent.componentPda)) {
    console.log(
      "initializeComponent",
      await engine.processSessionTransaction(initializeComponent.transaction)
    );
  }
  console.log(
    "initializeComponent.componentPda",
    initializeComponent.componentPda.toBase58()
  );

  // Done
  return addEntity.entityPda;
}
