import * as React from "react";

import { PublicKey } from "@solana/web3.js";

import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../../engine/MagicBlockEngine";

import { Text } from "../../util/Text";
import { ForEach } from "../../util/ForEach";

import { GameLobbyPlayer } from "./GameLobbyPlayer";

import { GameGridRows } from "../grid/GameGridRows";

import { gameSystemStart } from "../../../states/gameSystemStart";
import { gameSystemGenerate } from "../../../states/gameSystemGenerate";

export function GameLobbyRoot({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();

  React.useEffect(() => {
    scheduleGenerateOrStart(engine, entityPda, game);
  }, [engine, entityPda, game]);

  return (
    <>
      <div style={{ border: "2px solid rgba(255, 255, 255, 0.3)" }}>
        <ForEach
          values={game.players}
          renderer={(player, index) => (
            <GameLobbyPlayer
              key={index}
              playerIndex={index}
              player={player}
              entityPda={entityPda}
            />
          )}
        />
      </div>
      <Text value="Map Preview" />
      <GameGridRows game={game} />
    </>
  );
}

async function scheduleGenerateOrStart(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  game: any
) {
  const timeout = setTimeout(async () => {
    if (game.status.generate) {
      await gameSystemGenerate(engine, entityPda);
    }
    if (game.status.lobby) {
      let canStart = !!game.status.lobby;
      game.players.forEach((player: any) => {
        if (!player.ready) {
          canStart = false;
        }
      });
      if (canStart) {
        await gameSystemStart(engine, entityPda);
      }
    }
  });
  return () => {
    clearTimeout(timeout);
  };
}
