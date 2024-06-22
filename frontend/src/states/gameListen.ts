import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame } from "./gamePrograms";

export function gameListen(
  engine: MagicBlockEngine,
  gamePda: PublicKey,
  setGame: ({}) => void
) {
  const componentGame = getComponentGame(engine);

  let cancelled = false;
  componentGame.account.game.fetchNullable(gamePda).then((gameValue) => {
    if (!cancelled) {
      console.log("gameValue", gameValue);
      setGame(gameValue);
    }
  });

  const gameWatcher = componentGame.account.game.subscribe(gamePda);
  gameWatcher.addListener("change", (param: any) => {
    console.log("onChange", param);
    setGame(param);
  });
  return () => {
    cancelled = true;
    gameWatcher.removeAllListeners();
  };
}
