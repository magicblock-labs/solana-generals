import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import "./GamePlayer.scss";

export function GamePlayer({
  playerIndex,
  game,
}: {
  entityPda: PublicKey;
  playerIndex: number;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  const player = game.players[playerIndex];

  const name = "Player " + (playerIndex + 1);
  let description;
  if (player.ready) {
    if (player.authority.equals(engine.getSessionPayer())) {
      description = "You are the player";
    } else {
      description =
        "Owner: " + player.authority.toBase58().substring(0, 8) + "...";
    }
  } else {
    description = "Waiting for someone to join";
  }

  return (
    <div
      className={["GamePlayer", "Container", "HStack", "P" + playerIndex].join(
        " "
      )}
    >
      <div className="Name">{name}</div>
      <div className="Description">({description})</div>
    </div>
  );
}
