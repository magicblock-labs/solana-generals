import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  COMPONENT_GAME_PROGRAM_ID,
  SYSTEM_TICK_PROGRAM_ID,
} from "./gamePrograms";

export async function gameSystemTick(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const applySystem = await ApplySystem({
    authority: engine.getEphemeralKey(),
    systemId: SYSTEM_TICK_PROGRAM_ID,
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
  });
  return await engine.processSessionEphemTransaction(
    "SystemTick",
    applySystem.transaction
  );
}
