import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame, getSystemGenerate } from "./gamePrograms";

export async function gameSystemGenerate(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: getSystemGenerate(engine).programId,
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
    "SystemGenerate",
    applySystem.transaction,
    true
  );
}
