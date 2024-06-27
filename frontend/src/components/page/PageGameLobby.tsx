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
import { gameSystemGenerate } from "../../states/gameSystemGenerate";
import { gameSystemJoin } from "../../states/gameSystemJoin";
import { gameSystemStart } from "../../states/gameSystemStart";

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

  // Hint on game status
  let status = "?";
  if (game.status.lobby) {
    status = "Waiting for players to join";
  }
  if (game.status.playing) {
    status = "Game is playing";
  }
  if (game.status.finished) {
    status = "Game is finished";
  }

  return (
    <div className="PageGameLobby VStack">
      <div className="Title">Game {params.id.toString()}</div>
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
      <div className="Title">Map Preview</div>
      <div className="Map">
        <div className="Grid">
          <GameGridRows mini={true} game={game} />
        </div>
      </div>
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
        <div>Join</div>
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
        <div>Leave</div>
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
    .catch(console.error)
    .then(() => {
      console.log("Join done");
    });
}

function onClickStart(engine: MagicBlockEngine, entityPda: PublicKey) {
  gameSystemStart(engine, entityPda)
    .catch(console.error)
    .then(() => {
      console.log("Start done");
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
  if (game.status.playing) {
    return navigate("/game/play/" + entityPda.toBase58());
  }
  // If the game hasn't been generated yet, generate it
  if (game.status.generate) {
    const timeout = setTimeout(async () => {
      await gameSystemGenerate(engine, entityPda);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }
  // If the game needs starting, do it
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
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }
}
