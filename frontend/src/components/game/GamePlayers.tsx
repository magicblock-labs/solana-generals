import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { GamePlayer } from "./GamePlayer";

import { gameSystemStart } from "../../states/gameSystemStart";

export function GamePlayers({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();

  if (!game) {
    return <div>No game</div>;
  }

  let canStart = !!game.status.lobby;
  game.players.forEach((player: any) => {
    if (!player.ready) {
      canStart = false;
    }
  });
  const buttons = [];
  if (canStart) {
    buttons.push(
      <button
        key="start"
        onClick={() => {
          onClickStart(engine, entityPda);
        }}
      >
        Start
      </button>
    );
  }

  return (
    <div className="GamePlayers">
      GamePlayers {buttons}
      <div>
        {game.players.map((_: any, playerIndex: number) => (
          <GamePlayer
            key={playerIndex}
            entityPda={entityPda}
            playerIndex={playerIndex}
            game={game}
          />
        ))}
      </div>
    </div>
  );
}

function onClickStart(engine: MagicBlockEngine, entityPda: PublicKey) {
  gameSystemStart(engine, entityPda)
    .catch(console.error)
    .then(() => {
      console.log("Start done");
    });
}
