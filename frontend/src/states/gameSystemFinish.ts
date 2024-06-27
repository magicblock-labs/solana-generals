import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame, getSystemFinish } from "./gamePrograms";

export async function gameSystemFinish(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number
) {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: getSystemFinish(engine).programId,
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
    args: {
      player_index: playerIndex,
    },
  });
  await engine.processSessionTransaction(
    "SystemFinish",
    applySystem.transaction,
    false
  );
}
