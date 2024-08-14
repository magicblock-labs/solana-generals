import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphem } from "./gamePrograms";
import { gameSystemGenerate } from "./gameSystemGenerate";

export function gameListen(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey,
  setGame: (game: any) => void
) {
  return engine.subscribeToEphemAccountInfo(gamePda, (accountInfo) => {
    // If the game doesn't exist in the ephemeral
    if (!accountInfo) {
      // try to nudge it to be downloaded into the ephemeral validator if it exists on chain
      gameSystemGenerate(engine, entityPda).then(
        (value) => console.log("nudge generate success", value),
        (reason) => console.log("nudge generate fail", reason.toString())
      );
      // Display an error for now
      return setGame(null);
    }
    // If we found the game, decode its state
    const coder = getComponentGameOnEphem(engine).coder;
    return setGame(coder.accounts.decode("game", accountInfo.data));
  });
}
