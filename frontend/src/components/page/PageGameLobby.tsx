import * as React from "react";

import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { getComponentGame } from "../../states/gamePrograms";

import { GamePlayer } from "../game/GamePlayer";
import { GameGridRows } from "../game/grid/GameGridRows";

import { gameListen } from "../../states/gameListen";
import { gameSystemJoin } from "../../states/gameSystemJoin";
import { gameSystemStart } from "../../states/gameSystemStart";
import { gameSystemGenerate } from "../../states/gameSystemGenerate";

import "./PageGameLobby.scss";

export function PageGameLobby() {
  const navigate = useNavigate();
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
  const [game, setGame] = React.useState(undefined);
  React.useEffect(() => {
    return gameListen(engine, gamePda, setGame);
  }, [engine, gamePda]);

  // When the page is loaded, run some logic
  React.useEffect(() => {
    return onPageStartup(navigate, engine, entityPda, gamePda, game);
  }, [navigate, engine, entityPda, gamePda, game]);

  // Render the game
  if (!game) {
    return <></>;
  }
  return (
    <div className="PageGameLobby Container">
      <div className="Text Title">Game {params.id.toString()}</div>
      <div className="Players">
        {game.players.map((_: any, playerIndex: number) => (
          <PageGameLobbyPlayer
            key={playerIndex}
            playerIndex={playerIndex}
            entityPda={entityPda}
            game={game}
          />
        ))}
      </div>
      <div className="Text">Map Preview</div>
      <GameGridRows game={game} />
    </div>
  );
}

function PageGameLobbyPlayer({
  playerIndex,
  entityPda,
  game,
}: {
  playerIndex: number;
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  const player = game.players[playerIndex];

  let button;
  if (!player.ready) {
    button = (
      <button
        className="Join"
        onClick={() => {
          onClickJoin(engine, entityPda, playerIndex, true);
        }}
      >
        <div className="Text">Join</div>
      </button>
    );
  } else if (player.authority.equals(engine.getSessionPayer())) {
    button = (
      <button
        className="Leave"
        onClick={() => {
          onClickJoin(engine, entityPda, playerIndex, false);
        }}
      >
        <div className="Text">Leave</div>
      </button>
    );
  } else {
    button = <></>;
  }

  return (
    <div className="Player">
      <GamePlayer
        key={playerIndex}
        playerIndex={playerIndex}
        entityPda={entityPda}
        game={game}
      />
      {button}
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
    .catch((error) => {
      console.error("Failed to join", error);
    })
    .then(() => {
      console.log("Join done");
    });
}

function onPageStartup(
  navigate: NavigateFunction,
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey,
  game: any
) {
  // If we're still waiting for the game to load, nothing to do, just wait
  if (game === undefined) {
    return;
  }
  // If the game doesn't exist, we have a problem
  if (game === null) {
    return navigate("/error/lobby-no-game");
  }
  // If the game has started playing, go to play mode
  if (game.status.playing || game.status.finished) {
    return navigate("/game/play/" + entityPda.toBase58());
  }
  // If the game hasn't been generated yet, generate it if we can
  if (game.status.generate) {
    const timeout = setTimeout(async () => {
      await gameSystemGenerate(engine, entityPda);
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }
  // If the game needs starting, start it after a timeout
  if (game.status.lobby) {
    const timeout = setTimeout(async () => {
      let canStart = !!game.status.lobby;
      game.players.forEach((player: any) => {
        if (!player.ready) {
          canStart = false;
        }
      });
      if (canStart) {
        await gameSystemStart(engine, entityPda);
      }
    }, 1000);
    return () => {
      clearTimeout(timeout);
    };
  }
}
