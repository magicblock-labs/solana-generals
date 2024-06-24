import * as React from "react";

import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { getComponentGame } from "../../states/gamePrograms";
import { gameListen } from "../../states/gameListen";
import { gameSystemGenerate } from "../../states/gameSystemGenerate";
import { gameSystemTick } from "../../states/gameSystemTick";

import { GameGridRoot } from "../game/GameGridRoot";
import { GamePlayers } from "../game/GamePlayers";

import "./PageGamePlay.scss";

export function PageGamePlay() {
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
    gameSystemGenerate(engine, pdas.entityPda)
      .catch(console.error)
      .then(() => {
        console.log("success generate");
      });
  }, [engine, pdas, game]);

  // Constantly tick the game the game is playing
  React.useEffect(() => {
    return;
    if (!game || !game.status.playing) {
      return;
    }
    const interval = setInterval(() => {
      console.log("Game needs tick", game.growthNextSlot.toString());
      gameSystemTick(engine, pdas.entityPda)
        .catch(console.error)
        .then(() => {
          console.log("success tick");
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
  return (
    <div className="PageGamePlay">
      Game: {params.id.toString()}
      <GamePlayers entityPda={pdas.entityPda} game={game} />
      <GameGridRoot entityPda={pdas.entityPda} game={game} />
    </div>
  );
}
