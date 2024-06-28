import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame, getSystemStart } from "./gamePrograms";

export async function gameSystemStart(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: getSystemStart(engine).programId,
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
    "SystemStart",
    applySystem.transaction,
    true
  );
}
