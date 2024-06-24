import * as React from "react";

import { GameGridCell } from "./GameGridCell";

import "./GameGridRows.scss";

export function GameGridRows({
  horizontal,
  game,
  activity,
  onCommand,
}: {
  horizontal: boolean;
  game: any;
  activity?: { x: number; y: number };
  onCommand: (x: number, y: number, type: string) => void;
}) {
  if (!game) {
    return <div>No game</div>;
  }

  const rows = [];

  // If we want to render the game horizontally (for laptop/desktop)
  if (horizontal) {
    for (let y = 0; y < game.sizeY; y++) {
      const cells = [];
      for (let x = 0; x < game.sizeX; x++) {
        const cell = game.cells[y * game.sizeX + x];
        cells.push(
          <GameGridCell
            key={x}
            x={x}
            y={y}
            activity={activity}
            cell={cell}
            onCommand={onCommand}
          />
        );
      }
      rows.push(
        <div key={y} className="Row">
          {cells}
        </div>
      );
    }
  }
  // If we want to render ghe game vertically (for mobile)
  else {
    for (let x = 0; x < game.sizeX; x++) {
      const cells = [];
      for (let y = 0; y < game.sizeY; y++) {
        const cell = game.cells[y * game.sizeX + x];
        cells.push(
          <GameGridCell
            key={y}
            x={x}
            y={y}
            activity={activity}
            cell={cell}
            onCommand={onCommand}
          />
        );
      }
      rows.push(
        <div key={x} className="Row">
          {cells}
        </div>
      );
    }
  }

  return <div className="GameGridRows">{rows}</div>;
}
