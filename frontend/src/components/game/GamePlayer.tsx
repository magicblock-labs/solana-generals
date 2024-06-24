import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { gameSystemJoin } from "../../states/gameSystemJoin";

import "./GamePlayer.scss";

export function GamePlayer({
  entityPda,
  playerIndex,
  game,
}: {
  entityPda: PublicKey;
  playerIndex: number;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  const player = game.players[playerIndex];

  const ready = player.ready ? "ready" : "empty";
  const authority = player.authority.toBase58();

  const buttons = [];
  if (game.status.lobby) {
    if (!player.ready) {
      buttons.push(
        <button
          key="join:true"
          onClick={() => {
            onClickJoin(engine, entityPda, playerIndex, true);
          }}
        >
          Join
        </button>
      );
    }
    if (player.authority == engine.getSessionPayer()) {
      buttons.push(
        <button
          key="join:false"
          onClick={() => {
            onClickJoin(engine, entityPda, playerIndex, false);
          }}
        >
          Leave
        </button>
      );
    }
  }

  const classNames = ["GamePlayer", "Player" + playerIndex];
  return (
    <div className={classNames.join(" ")}>
      {ready} / {authority} {buttons}
    </div>
  );
}

function onClickJoin(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number,
  join: boolean
) {
  gameSystemJoin(engine, entityPda, playerIndex, join)
    .catch(console.error)
    .then(() => {
      console.log("Join done");
    });
}
