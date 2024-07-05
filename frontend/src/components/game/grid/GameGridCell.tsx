import * as React from "react";

import GameGridCellField from "./GameGridCellField.png";
import GameGridCellCity from "./GameGridCellCity.png";
import GameGridCellCapital from "./GameGridCellCapital.png";
import GameGridCellMountain from "./GameGridCellMountain.png";

import { useMagicBlockEngine } from "../../../engine/MagicBlockEngine";

import { If } from "../../util/If";

import "./GameGridCell.scss";

export function GameGridCell({
  x,
  y,
  size,
  game,
  active,
  onCommand,
}: {
  x: number;
  y: number;
  size: number;
  game: any;
  active: boolean;
  onCommand?: (x: number, y: number, type: string) => void;
}) {
  const engine = useMagicBlockEngine();
  const cell = game.cells[y * game.sizeX + x];

  let rootClassNames = ["GameGridCell"];

  if (cell.owner.player) {
    const playerIndex = cell.owner.player[0];
    rootClassNames.push("Player" + playerIndex);
    const player = game.players[playerIndex];
    if (onCommand && player.authority.equals(engine.getSessionPayer())) {
      rootClassNames.push("Owned");
    }
  }
  if (active) {
    rootClassNames.push("Active");
  }

  let image = "";
  if (cell.kind.field) {
    image = GameGridCellField;
  }
  if (cell.kind.city) {
    image = GameGridCellCity;
  }
  if (cell.kind.capital) {
    image = GameGridCellCapital;
  }
  if (cell.kind.mountain) {
    image = GameGridCellMountain;
  }

  const onStart = makeEventHandler(x, y, "start", onCommand);
  const onMove = makeEventHandler(x, y, "move", onCommand);
  const onEnd = makeEventHandler(x, y, "end", onCommand);

  let fontSize = 6 + Math.floor(size / 4);

  return (
    <div
      className={rootClassNames.join(" ")}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      onMouseDown={onStart}
      onMouseMove={onMove}
      onMouseUp={onEnd}
      style={{ width: size, height: size }}
    >
      <img className="Type" src={image} />
      <If
        value={cell.strength}
        renderer={(strength) => (
          <div className="Strength" style={{ fontSize }}>
            {strength}
          </div>
        )}
      />
    </div>
  );
}

function makeEventHandler(
  x: number,
  y: number,
  type: string,
  onCommand?: (x: number, y: number, type: string) => void
) {
  if (!onCommand) {
    return undefined;
  }
  return (event: React.UIEvent) => {
    event.preventDefault();
    onCommand(x, y, type);
  };
}
