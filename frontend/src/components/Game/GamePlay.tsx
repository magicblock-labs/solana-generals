import * as React from "react";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { gameListen } from "../../states/gameListen";
import { gameGenerate } from "../../states/gameGenerate";

import { GameGrid } from "./GameGrid";
import { getComponentGame } from "../../states/gamePrograms";
import { GameLobby } from "./GameLobby";
import { gameTick } from "../../states/gameTick";

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
    if (!game || !game.status.generate) {
      return;
    }
    console.log("Game needs generate");
    gameGenerate(engine, pdas.entityPda).then(() => {
      console.log("success generate");
    });
  }, [engine, pdas, game]);

  // Constantly tick the game the game is playing
  React.useEffect(() => {
    if (!game || !game.status.playing) {
      return;
    }
    const interval = setInterval(() => {
      console.log("Game needs tick", game.growthNextSlot.toString());
      gameTick(engine, pdas.entityPda).then(() => {
        console.log("success tick");

        engine.getSlot().then((slot) => {
          console.log("get slot", slot);
        });
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [engine, pdas, game]);

  // If the game doesn't exist, display error
  if (game == null) {
    return <div>No Game ?</div>;
  }

  // Render the game
  console.log("pdas.entityPda", pdas.entityPda.toBase58());
  console.log("pdas.gamePda", pdas.gamePda.toBase58());
  console.log("game", game);
  return (
    <>
      Game: {params.id.toString()}
      <GameLobby entityPda={pdas.entityPda} game={game}></GameLobby>
      <GameGrid entityPda={pdas.entityPda} game={game}></GameGrid>
    </>
  );
}
