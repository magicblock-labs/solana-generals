import * as React from "react";

import GameGridCellField from "./GameGridCellField.png";
import GameGridCellCity from "./GameGridCellCity.png";
import GameGridCellCapital from "./GameGridCellCapital.png";
import GameGridCellMountain from "./GameGridCellMountain.png";

import "./GameGridCell.scss";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngine";

export function GameGridCell({
  x,
  y,
  game,
  mini,
  active,
  onCommand,
}: {
  x: number;
  y: number;
  game: any;
  mini: boolean;
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
  if (mini) {
    rootClassNames.push("Mini");
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

  let strength = cell.strength ? cell.strength.toString() : "";

  return (
    <div
      className={rootClassNames.join(" ")}
      onTouchStart={makeEventHandler(x, y, "start", onCommand)}
      onTouchMove={makeEventHandler(x, y, "move", onCommand)}
      onTouchEnd={makeEventHandler(x, y, "end", onCommand)}
      onMouseDown={makeEventHandler(x, y, "start", onCommand)}
      onMouseMove={makeEventHandler(x, y, "move", onCommand)}
      onMouseUp={makeEventHandler(x, y, "end", onCommand)}
    >
      <img className="Type" src={image} />
      {strength ? <div className="Strength">{strength}</div> : undefined}
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
