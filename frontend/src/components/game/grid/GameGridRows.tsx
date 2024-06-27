import * as React from "react";

import { GameGridCell } from "./GameGridCell";

import "./GameGridRows.scss";

const HORIZONTAL_WIDTH = 804;

export function GameGridRows({
  game,
  mini,
  activity,
  onCommand,
}: {
  game: any;
  mini: boolean;
  activity?: { x: number; y: number };
  onCommand?: (x: number, y: number, type: string) => void;
}) {
  const rows = [];

  // Display the grid horizontally when we have enough space
  const [horizontal, setHorizontal] = React.useState(
    window.innerWidth > HORIZONTAL_WIDTH
  );
  React.useEffect(() => {
    function onResize() {
      setHorizontal(window.innerWidth > HORIZONTAL_WIDTH);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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
            cell={cell}
            mini={mini}
            active={activity ? activity.x == x && activity.y == y : false}
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
      for (let y = game.sizeY - 1; y >= 0; y--) {
        const cell = game.cells[y * game.sizeX + x];
        cells.push(
          <GameGridCell
            key={y}
            x={x}
            y={y}
            cell={cell}
            mini={mini}
            active={activity ? activity.x == x && activity.y == y : false}
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
