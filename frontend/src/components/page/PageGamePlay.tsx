import * as React from "react";

import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { getComponentGame } from "../../states/gamePrograms";

import { GameGridRoot } from "../game/GameGridRoot";
import { GamePlayers } from "../game/GamePlayers";

import { gameInitialize } from "../../states/gameInitialize";
import { gameDelegate } from "../../states/gameDelegate";
import { gameListen } from "../../states/gameListen";
import { gameSystemGenerate } from "../../states/gameSystemGenerate";
import { gameSystemTick } from "../../states/gameSystemTick";

import "./PageGamePlay.scss";

export function PageGamePlay() {
  const params = useParams();
  const engine = useMagicBlockEngine();

  // Extract PDAs from the URL
  const { entityPda, gamePda } = React.useMemo(() => {
    const entityPda = new PublicKey(params.id);
    return {
      entityPda,
      gamePda: FindComponentPda({
        entity: entityPda,
        componentId: getComponentGame(engine).programId,
      }),
    };
  }, [params]);

  // Listen to changes on the game PDA's data
  const [game, setGame] = React.useState(null);
  React.useEffect(() => {
    return gameListen(engine, gamePda, setGame);
  }, [engine, gamePda]);

  // Start game systems
  React.useEffect(() => {
    return setupPageEffects(engine, entityPda, gamePda, game);
  }, [engine, entityPda, gamePda, game]);

  // Render the game
  if (game == null) {
    return <div>No Game ?</div>;
  }
  return (
    <div className="PageGamePlay">
      Game: {params.id.toString()}
      <GamePlayers entityPda={entityPda} game={game} />
      <GameGridRoot entityPda={entityPda} game={game} />
    </div>
  );
}

function setupPageEffects(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey,
  game: any
) {
  console.log("setup", game);
  // If the game doesn't exist, try to create it and that's it
  if (!game) {
    (async () => {
      const accountInfo = await engine
        .getConnectionChain()
        .getAccountInfo(gamePda);
      if (accountInfo == null) {
        console.log("Game needs init");
        return await gameInitialize(engine, entityPda);
      }
      /*
      if (accountInfo.owner.equals(getComponentGame(engine).programId)) {
        console.log("Game needs delegate");
        return await gameDelegate(engine, entityPda, gamePda);
      }
        */
    })();
    return;
  }
  // If the game hasn't been generated yet, generate it and that's it
  if (game.status.generate) {
    (async () => {
      console.log("Game needs generate");
      await gameSystemGenerate(engine, entityPda);
    })();
    return;
  }
  // If the game has started playing, launch the ticking
  if (game.status.playing) {
    /*
    const interval = setInterval(async () => {
      console.log("Game needs tick", game.growthNextSlot.toString());
      await gameSystemTick(engine, entityPda);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    */
  }
}
