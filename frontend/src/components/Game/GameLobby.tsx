import * as React from "react";
import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";
import { PublicKey } from "@solana/web3.js";
import { gameSystemJoin } from "../../states/gameSystemJoin";
import { gameSystemStart } from "../../states/gameSystemStart";

function doJoin(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number,
  join: boolean
) {
  gameSystemJoin(engine, entityPda, playerIndex, join).then(() => {
    console.log("Join done");
  });
}

function doStart(engine: MagicBlockEngine, entityPda: PublicKey) {
  gameSystemStart(engine, entityPda).then(() => {
    console.log("Start done");
  });
}

export function GameLobby({
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

  const rows = game.players.map((player: any, playerIndex: number) => {
    const ready = player.ready ? "ready" : "empty";
    const authority = player.authority.toBase58();

    if (!player.ready) {
      canStart = false;
    }

    const buttons = [];
    if (game.status.lobby) {
      if (!player.ready) {
        buttons.push(
          <button
            onClick={() => {
              doJoin(engine, entityPda, playerIndex, true);
            }}
          >
            Join
          </button>
        );
      }
      if (player.authority == engine.getSessionPayer()) {
        buttons.push(
          <button
            onClick={() => {
              doJoin(engine, entityPda, playerIndex, false);
            }}
          >
            Leave
          </button>
        );
      }
    }

    return (
      <div key={playerIndex}>
        {ready} / {authority} {buttons}
      </div>
    );
  });

  const buttons = [];
  if (canStart) {
    buttons.push(
      <button
        onClick={() => {
          doStart(engine, entityPda);
        }}
      >
        Start
      </button>
    );
  }

  return (
    <div>
      GameLobby {buttons}
      <div>{rows}</div>
    </div>
  );
}
