import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphem } from "./gamePrograms";

export function gameListen(
  engine: MagicBlockEngine,
  gamePda: PublicKey,
  setGame: (game: any) => void
) {
  const componentGame = getComponentGameOnEphem(engine);

  return engine.subscribeToEphemAccountInfo(gamePda, (accountInfo) => {
    if (!accountInfo) {
      return setGame(null);
    }
    const game = componentGame.coder.accounts.decode("game", accountInfo.data);
    return setGame(game);
  });
}
