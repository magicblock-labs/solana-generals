import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  COMPONENT_GAME_PROGRAM_ID,
  SYSTEM_JOIN_PROGRAM_ID,
} from "./gamePrograms";

export async function gameSystemJoin(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number,
  join: boolean
) {
  const applySystem = await ApplySystem({
    authority: engine.getEphemeralKey(),
    systemId: SYSTEM_JOIN_PROGRAM_ID,
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
      join,
    },
  });
  return await engine.processSessionEphemTransaction(
    "SystemJoin:" + playerIndex,
    applySystem.transaction
  );
}
