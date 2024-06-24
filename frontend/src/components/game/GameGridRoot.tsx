import * as React from "react";

import { PublicKey } from "@solana/web3.js";
import { GameGridRows } from "./GameGridRows";

import "./GameGridRoot.scss";
import { gameSystemTick } from "../../states/gameSystemTick";
import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";
import { gameSystemCommand } from "../../states/gameSystemCommand";

export function GameGridRoot({
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

        const attack = computeAttack(engine, game, sourceX, sourceY);
        if (attack !== undefined) {
          gameSystemCommand(
            engine,
            entityPda,
            attack.playerIndex,
            sourceX,
            sourceY,
            targetX,
            targetY,
            attack.strength
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

  const onTick = () => {
    gameSystemTick(engine, entityPda);
  };

  const [horizontal, setHorizontal] = React.useState(true);
  const onFlip = () => {
    setHorizontal(!horizontal);
  };

  let activity = undefined;
  if (command.active) {
    const sourceX = command.sourceX;
    const sourceY = command.sourceY;
    if (computeAttack(engine, game, sourceX, sourceY) !== undefined) {
      activity = { x: sourceX, y: sourceY };
    }
  }

  return (
    <div className="GameGridRoot">
      <button onClick={onTick}>Tick</button>
      <button onClick={onFlip}>Flip</button>
      <GameGridRows
        horizontal={horizontal}
        game={game}
        activity={activity}
        onCommand={onCommand}
      />
    </div>
  );
}

function computeAttack(
  engine: MagicBlockEngine,
  game: any,
  sourceX: number,
  sourceY: number
) {
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
    strength: sourceStrength,
  };
}
