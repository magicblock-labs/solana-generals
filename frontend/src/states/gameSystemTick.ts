import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame, getSystemTick } from "./gamePrograms";

export async function gameSystemTick(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: getSystemTick(engine).programId,
    entities: [
      {
        entity: entityPda,
        components: [
          {
            componentId: getComponentGame(engine).programId,
          },
        ],
      },
    ],
  });
  await engine.processSessionTransaction(
    "SystemTick",
    applySystem.transaction,
    false
  );
}
