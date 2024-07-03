import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphemeral } from "./gamePrograms";

export function gameListen(
  engine: MagicBlockEngine,
  gamePda: PublicKey,
  setGame: (game: any) => void
) {
  const componentGame = getComponentGameOnEphemeral(engine);

  let cancelled = false;
  componentGame.account.game
    .fetchNullable(gamePda)
    .catch(console.error)
    .then((game) => {
      if (!cancelled) {
        setGame(game);
      }
    });

  const gameWatcher = componentGame.account.game.subscribe(gamePda);
  gameWatcher.addListener("change", setGame);
  return () => {
    cancelled = true;
    gameWatcher.removeListener(setGame);
  };
}
