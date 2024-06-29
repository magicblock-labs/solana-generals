import {
  Entity,
  FindComponentPda,
  FindEntityPda,
  World,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import { WORLD_PDA, getComponentGame } from "./gamePrograms";

export async function gameList(engine: MagicBlockEngine, count: number) {
  const componentGame = getComponentGame(engine);
  const world = await World.fromAccountAddress(
    engine.getConnectionChain(),
    WORLD_PDA
  );

  let entityId = world.entities;
  const found = [];
  while (!entityId.isNeg() && found.length < count) {
    const entityPda = FindEntityPda({
      worldId: world.id,
      entityId: entityId,
    });
    const gamePda = FindComponentPda({
      componentId: componentGame.programId,
      entity: entityPda,
    });
    const game = await componentGame.account.game.fetchNullable(gamePda);
    console.log("Check game", entityId.toString(), game);
    if (game) {
      found.push({
        entityPda,
        entityId,
        gamePda,
        game,
      });
    }
    entityId = entityId.subn(1);
  }
  return found;
}
