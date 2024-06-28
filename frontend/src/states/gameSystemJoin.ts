import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame, getSystemJoin } from "./gamePrograms";

export async function gameSystemJoin(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number,
  join: boolean
) {
  const applySystem = await ApplySystem({
    authority: engine.getSessionPayer(),
    systemId: getSystemJoin(engine).programId,
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
      join,
    },
  });
  await engine.processSessionEphemeralTransaction(
    "SystemJoin",
    applySystem.transaction
  );
}
