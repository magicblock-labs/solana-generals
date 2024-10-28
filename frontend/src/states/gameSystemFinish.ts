import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  SYSTEM_FINISH_PROGRAM_ID,
  COMPONENT_GAME_PROGRAM_ID,
} from "./gamePrograms";

export async function gameSystemFinish(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number
) {
  const applySystem = await ApplySystem({
    authority: engine.getEphemKey(),
    systemId: SYSTEM_FINISH_PROGRAM_ID,
    entities: [
      {
        entity: entityPda,
        components: [
          {
            componentId: COMPONENT_GAME_PROGRAM_ID,
          },
        ],
      },
    ],
    args: {
      player_index: playerIndex,
    },
  });
  return await engine.processSessionEphemTransaction(
    "SystemFinish:" + playerIndex,
    applySystem.transaction
  );
}
