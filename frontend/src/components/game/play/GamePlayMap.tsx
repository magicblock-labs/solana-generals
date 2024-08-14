import * as React from "react";

import { PublicKey } from "@solana/web3.js";

import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { MagicBlockQueue } from "../../../engine/MagicBlockQueue";

import { GameGridRows } from "../grid/GameGridRows";

import { gameSystemCommand } from "../../../states/gameSystemCommand";

export function GamePlayMap({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();

  const queue = React.useMemo(() => {
    return new MagicBlockQueue(engine, 100);
  }, [engine]);

  const [command, setCommand] = React.useState({
    active: false,
    sourceX: 0,
    sourceY: 0,
    sourcePlayerIndex: 0,
  });

  let lastCommand = {
    sourcePlayerIndex: -1,
    sourceX: -1,
    sourceY: -1,
    targetX: -1,
    targetY: -1,
  };

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
        const sourcePlayerIndex = command.sourcePlayerIndex;
        const sourceX = command.sourceX;
        const sourceY = command.sourceY;
        if (sourceX === targetX && sourceY === targetY) {
          return;
        }

        if (
          lastCommand.sourcePlayerIndex === sourcePlayerIndex &&
          lastCommand.sourceX === sourceX &&
          lastCommand.sourceY === sourceY &&
          lastCommand.targetX === targetX &&
          lastCommand.targetY === targetY
        ) {
          return;
        }
        lastCommand = {
          sourcePlayerIndex,
          sourceX,
          sourceY,
          targetX,
          targetY,
        };

        console.log(
          "onCommand.attack",
          sourceX + "x" + sourceY,
          targetX + "x" + targetY
        );
        gameSystemCommand(
          queue,
          entityPda,
          sourcePlayerIndex,
          sourceX,
          sourceY,
          targetX,
          targetY,
          100
        ).then(
          (value: string) => {
            console.log(
              "onCommand.success",
              sourceX + "x" + sourceY,
              targetX + "x" + targetY,
              value
            );
          },
          (reason: any) => {
            console.warn(
              "onCommand.fail",
              sourceX + "x" + sourceY,
              targetX + "x" + targetY,
              reason,
              game
            );
          }
        );
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
