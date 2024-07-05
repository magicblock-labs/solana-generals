import * as React from "react";

import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { Text } from "../util/Text";

import { COMPONENT_GAME_PROGRAM_ID } from "../../states/gamePrograms";

import { gameListen } from "../../states/gameListen";

import { GameLobbyRoot } from "../game/lobby/GameLobbyRoot";
import { GamePlayRoot } from "../game/play/GamePlayRoot";
import { GameError } from "../game/GameError";

export function PagePlay() {
  const params = useParams();
  const engine = useMagicBlockEngine();

  // Extract PDAs from the URL
  const { entityPda, gamePda } = React.useMemo(() => {
    const entityPda = new PublicKey(params.id);
    return {
      entityPda,
      gamePda: FindComponentPda({
        entity: entityPda,
        componentId: COMPONENT_GAME_PROGRAM_ID,
      }),
    };
  }, [params]);

  // Listen to changes on the game PDA's data
  const [game, setGame] = React.useState(undefined);
  React.useEffect(() => {
    return gameListen(engine, gamePda, setGame);
  }, [engine, gamePda]);

  if (game === null) {
    return <GameError message="Unable to fetch the game data" />;
  }

  // Render the game
  return (
    <div className="Container Centered">
      <Text value={"Game: " + entityPda.toBase58()} isTitle={true} />
      {(() => {
        if (game === undefined) {
          return <></>; // Loading
        }
        if (game.status.generate || game.status.lobby) {
          return <GameLobbyRoot entityPda={entityPda} game={game} />;
        }
        if (game.status.playing || game.status.finished) {
          return (
            <GamePlayRoot entityPda={entityPda} gamePda={gamePda} game={game} />
          );
        }
      })()}
    </div>
  );
}
