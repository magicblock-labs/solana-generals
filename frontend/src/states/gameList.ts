import { FindEntityPda, World } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { WORLD_PDA } from "./gamePrograms";

export async function gameList(engine: MagicBlockEngine) {
  const world = await World.fromAccountAddress(
    engine.getConnectionChain(),
    WORLD_PDA
  );

  let entityId = world.entities;
  const found = [];
  while (!entityId.isNeg() && found.length < 10) {
    const entityPda = FindEntityPda({
      worldId: world.id,
      entityId: entityId,
    });
    const accountInfo = await engine
      .getConnectionChain()
      .getAccountInfo(entityPda);
    if (accountInfo) {
      found.push(entityPda);
    }
    entityId = entityId.subn(1);
  }
  return found;
}
