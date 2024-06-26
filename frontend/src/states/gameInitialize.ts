import { PublicKey } from "@solana/web3.js";
import { InitializeComponent } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame } from "./gamePrograms";

export async function gameInitialize(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const initializeComponent = await InitializeComponent({
    payer: engine.getSessionPayer(),
    entity: entityPda,
    componentId: getComponentGame(engine).programId,
  });
  await engine.processSessionTransaction(
    "InitializeComponent",
    initializeComponent.transaction,
    false
  );
}
