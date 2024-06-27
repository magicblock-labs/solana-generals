import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame, getSystemCommand } from "./gamePrograms";

export async function gameSystemCommand(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  strength: number
) {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: getSystemCommand(engine).programId,
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
      source_x: sourceX,
      source_y: sourceY,
      target_x: targetX,
      target_y: targetY,
      strength: strength,
    },
  });
  await engine.processSessionTransaction(
    "SystemCommand",
    applySystem.transaction,
    false
  );
}
