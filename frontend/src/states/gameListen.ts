import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphemeral } from "./gamePrograms";

export function gameListen(
  engine: MagicBlockEngine,
  gamePda: PublicKey,
  setGame: (game: any) => void
) {
  const componentGame = getComponentGameOnEphemeral(engine);

  return engine.subscribeToEphemeralAccountInfo(gamePda, (accountInfo) => {
    const game = componentGame.coder.accounts.decode("game", accountInfo.data);
    setGame(game);
  });
}
