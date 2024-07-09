import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import {
  SYSTEM_COMMAND_PROGRAM_ID,
  COMPONENT_GAME_PROGRAM_ID,
} from "./gamePrograms";

import { MagicBlockQueue } from "../engine/MagicBlockQueue";

export async function gameSystemCommand(
  queue: MagicBlockQueue,
  entityPda: PublicKey,
  playerIndex: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  strengthPercent: number
) {
  const applySystem = await ApplySystem({
    authority: queue.getSessionPayer(),
    systemId: SYSTEM_COMMAND_PROGRAM_ID,
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
      source_x: sourceX,
      source_y: sourceY,
      target_x: targetX,
      target_y: targetY,
      strength_percent: strengthPercent,
    },
  });
  return await queue.processSessionEphemeralTransaction(
    "SystemCommand:" +
      playerIndex +
      " (" +
      sourceX +
      "x" +
      sourceY +
      "->" +
      targetX +
      "x" +
      targetY +
      ")",
    applySystem.transaction
  );
}
