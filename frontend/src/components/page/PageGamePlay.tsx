import * as React from "react";

import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { COMPONENT_GAME_PROGRAM_ID } from "../../states/gamePrograms";

import { GameGridRows } from "../game/grid/GameGridRows";
import { GamePlayer } from "../game/GamePlayer";

import { gameListen } from "../../states/gameListen";
import { gameSystemTick } from "../../states/gameSystemTick";
import { gameSystemCommand } from "../../states/gameSystemCommand";
import { gameSystemFinish } from "../../states/gameSystemFinish";

import "./PageGamePlay.scss";

export function PageGamePlay() {
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
        componentId: COMPONENT_GAME_PROGRAM_ID,
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

  // Run a ticker (the ticker doesnt depend on game state)
  React.useEffect(() => {
    return onPageCrank(engine, entityPda);
  }, [engine, entityPda]);

  // Render the game
  if (game == null) {
    return <></>;
  }

  // Hint on game status
  let status = "?";
  if (game.status.playing) {
    status = "The game is in progress!";
  }
  if (game.status.finished) {
    status = "The game is finished.";
  }

  return (
    <div className="PageGamePlay Container">
      <div className="Text Title"> Game: {params.id.toString()}</div>
      <div className="Players">
        {game.players.map((_: any, playerIndex: number) => (
          <div className="Player" key={playerIndex}>
            <GamePlayer
              playerIndex={playerIndex}
              entityPda={entityPda}
              game={game}
            />
          </div>
        ))}
      </div>
      <div className="Text">Drag and drop your army on the map</div>
      <PageGamePlayMap entityPda={entityPda} game={game} />
      <div className="Text">{status}</div>
    </div>
  );
}

function PageGamePlayMap({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();

  const [command, setCommand] = React.useState({
    active: false,
    sourceX: 0,
    sourceY: 0,
    sourcePlayerIndex: 0,
  });

  const onCommand = (targetX: number, targetY: number, type: string) => {
    switch (type) {
      case "start": {
        if (!game.status.playing) {
          return;
        }
        const targetCell = game.cells[targetY * game.sizeX + targetX];
        if (!targetCell) {
          return;
        }
        if (!targetCell.owner.player) {
          return;
        }
        const targetPlayerIndex = targetCell.owner.player[0];
        const targetPlayer = game.players[targetPlayerIndex];
        if (!targetPlayer.authority.equals(engine.getSessionPayer())) {
          return;
        }
        console.log("onCommand.start");
        return setCommand({
          active: true,
          sourceX: targetX,
          sourceY: targetY,
          sourcePlayerIndex: targetPlayerIndex,
        });
      }
      case "end": {
        if (!command.active) {
          return;
        }
        console.log("onCommand.end");
        return setCommand({ ...command, active: false });
      }
      case "move": {
        if (!command.active) {
          return;
        }
        const sourceX = command.sourceX;
        const sourceY = command.sourceY;
        if (sourceX === targetX && sourceY === targetY) {
          return;
        }
        const sourcePlayerIndex = command.sourcePlayerIndex;
        console.log(
          "onCommand.attack",
          sourceX + "x" + sourceY,
          targetX + "x" + targetY
        );
        gameSystemCommand(
          engine,
          entityPda,
          sourcePlayerIndex,
          sourceX,
          sourceY,
          targetX,
          targetY,
          100
        )
          .catch((error) => {
            console.log(
              "onCommand.fail",
              sourceX + "x" + sourceY,
              targetX + "x" + targetY
            );
          })
          .then(() => {
            console.log(
              "onCommand.success",
              sourceX + "x" + sourceY,
              targetX + "x" + targetY
            );
          });
        return setCommand({
          active: true,
          sourceX: targetX,
          sourceY: targetY,
          sourcePlayerIndex: sourcePlayerIndex,
        });
      }
    }
  };

  let activity = undefined;
  if (command.active) {
    activity = { x: command.sourceX, y: command.sourceY };
  }

  return <GameGridRows game={game} activity={activity} onCommand={onCommand} />;
}

function onPageStartup(
  navigate: NavigateFunction,
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey,
  game: any
) {
  // If we're still waiting for the game to load, nothing to do
  if (game === undefined) {
    return;
  }
  // If there's no game, we have problem
  if (game === null) {
    return navigate("/error/play-no-game");
  }
  // If the game is not playing yet, go back to lobby
  if (game.status.generate || game.status.lobby) {
    return navigate("/game/lobby/" + entityPda.toBase58());
  }
  // If the game has started playing, we need to run some logic
  if (game.status.playing) {
    let running = true;
    (async () => {
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        if (!running) {
          return;
        }
        try {
          await gameSystemFinish(engine, entityPda, 0);
          await gameSystemFinish(engine, entityPda, 1);
        } catch (error) {
          console.error("failed to finish the game", error);
        }
      }
    })();
    return () => {
      running = false;
    };
  }
}

function onPageCrank(engine: MagicBlockEngine, entityPda: PublicKey) {
  let running = true;
  (async () => {
    console.log("start crank");
    while (running) {
      console.log("tick");
      try {
        await gameSystemTick(engine, entityPda);
      } catch (error) {
        console.error("failed to tick the game", error);
      }
    }
  })();
  return () => {
    console.log("stop crank");
    running = false;
  };
}
