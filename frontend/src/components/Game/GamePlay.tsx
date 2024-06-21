import * as React from "react";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { gameListen } from "../../state/gameListen";
import { gameGenerate } from "../../state/gameGenerate";

import { GameGrid } from "./GameGrid";
import { getComponentGame } from "../../state/gamePrograms";
import { GameLobby } from "./GameLobby";

export function GamePlay() {
  const params = useParams();
  const engine = useMagicBlockEngine();

  // Extract PDAs from the URL
  const pdas = React.useMemo(() => {
    const entityPda = new PublicKey(params.id);
    return {
      entityPda,
      gamePda: FindComponentPda(getComponentGame(engine).programId, entityPda),
    };
  }, [params]);

  // Listen to changes on the game PDA's data
  const [game, setGame] = React.useState(null);
  React.useEffect(() => {
    return gameListen(engine, pdas.gamePda, setGame);
  }, [engine, pdas]);

  // If the game hasn't been generated yet, generate it
  React.useEffect(() => {
    if (game && game.status.generate !== undefined) {
      console.log("Game needs generate");
      const result = gameGenerate(engine, pdas.entityPda);
      result.then(() => {
        console.log("success generate");
      });
    }
  }, [engine, pdas, game]);

  // Render the game
  console.log("pdas.entityPda", pdas.entityPda.toBase58());
  console.log("pdas.gamePda", pdas.gamePda.toBase58());
  console.log("game", game);
  return (
    <>
      Game: {params.id.toString()}
      <GameLobby game={game}></GameLobby>
      <GameGrid game={game}></GameGrid>
    </>
  );
}
