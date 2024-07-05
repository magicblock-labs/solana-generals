import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphemeral } from "./gamePrograms";

export async function gameFetch(engine: MagicBlockEngine, gamePda: PublicKey) {
  const componentGame = getComponentGameOnEphemeral(engine);
  return componentGame.account.game.fetchNullable(gamePda);
}
