import * as React from "react";

import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { getComponentGame } from "../../states/gamePrograms";

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
    <div className="PageGamePlay VStack">
      <div className="Title"> Game: {params.id.toString()}</div>
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
      <div className="Title">Drag and drop your army on the map</div>
      <div className="Map">
        <div className="Grid">
          <PageGamePlayMap entityPda={entityPda} game={game} />
        </div>
      </div>
      <div className="Title">{status}</div>
    </div>
  );
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
  // If the game has started playing, we need to run the logic on intervals
  if (game.status.playing) {
    const intervalTick = setInterval(async () => {
      try {
        await gameSystemTick(engine, entityPda);
      } catch (error) {
        console.error("failed to tick the game", error);
      }
    }, 2000);
    const intervalFinish = setInterval(async () => {
      try {
        await gameSystemFinish(engine, entityPda, 0);
        await gameSystemFinish(engine, entityPda, 1);
      } catch (error) {
        console.error("failed to finish the game", error);
      }
    }, 5000);
    return () => {
      clearInterval(intervalTick);
      clearInterval(intervalFinish);
    };
  }
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
  });
  const onCommand = (targetX: number, targetY: number, type: string) => {
    switch (type) {
      case "start": {
        setCommand({ active: true, sourceX: targetX, sourceY: targetY });
        break;
      }
      case "end": {
        setCommand({ active: false, sourceX: targetX, sourceY: targetY });
        break;
      }
      case "move": {
        if (!command.active) {
          break;
        }

        const sourceX = command.sourceX;
        const sourceY = command.sourceY;
        if (sourceX === targetX && sourceY === targetY) {
          break;
        }

        const attackSource = computeAttackSource(
          engine,
          game,
          sourceX,
          sourceY
        );
        if (attackSource !== undefined) {
          gameSystemCommand(
            engine,
            entityPda,
            attackSource.playerIndex,
            sourceX,
            sourceY,
            targetX,
            targetY,
            attackSource.strengthPercent
          )
            .catch(console.error)
            .then(() => {
              console.log("Command success");
            });
        }

        setCommand({
          active: true,
          sourceX: targetX,
          sourceY: targetY,
        });
      }
    }
  };

  let activity = undefined;
  if (command.active) {
    const sourceX = command.sourceX;
    const sourceY = command.sourceY;
    if (computeAttackSource(engine, game, sourceX, sourceY) !== undefined) {
      activity = { x: sourceX, y: sourceY };
    }
  }

  return (
    <div className="GameGridRoot">
      <GameGridRows
        game={game}
        mini={false}
        activity={activity}
        onCommand={onCommand}
      />
    </div>
  );
}

function computeAttackSource(
  engine: MagicBlockEngine,
  game: any,
  sourceX: number,
  sourceY: number
) {
  if (!game.status.playing) {
    return undefined;
  }

  const sourceCell = game.cells[sourceY * game.sizeX + sourceX];
  if (!sourceCell.owner.player) {
    return undefined;
  }

  const sourcePlayerIndex = sourceCell.owner.player[0];
  const sourceAuthority = game.players[sourcePlayerIndex].authority;
  if (!engine.getSessionPayer().equals(sourceAuthority)) {
    return undefined;
  }

  const sourceStrength = sourceCell.strength - 1;
  if (sourceStrength <= 0) {
    return undefined;
  }

  return {
    playerIndex: sourcePlayerIndex,
    strengthPercent: 100,
  };
}
