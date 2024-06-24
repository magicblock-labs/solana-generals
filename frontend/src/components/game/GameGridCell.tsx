import * as React from "react";

import "./GameGridCell.scss";

export function GameGridCell({
  x,
  y,
  cell,
  activity,
  onCommand,
}: {
  x: number;
  y: number;
  cell: any;
  activity?: { x: number; y: number };
  onCommand: (x: number, y: number, type: string) => void;
}) {
  let type = "?";
  if (cell.kind.field) {
    type = "🌳";
  }
  if (cell.kind.montain) {
    type = "⛰️";
  }
  if (cell.kind.city) {
    type = "🏛️";
  }
  if (cell.kind.capital) {
    type = "👑";
  }

  let rootClassNames = ["GameGridCellRoot"];
  if (cell.owner.player) {
    rootClassNames.push("Player" + cell.owner.player[0]);
  }
  if (activity && activity.x == x && activity.y == y) {
    rootClassNames.push("Active");
  }

  let strength = cell.strength ? cell.strength.toString() : "";

  return (
    <div
      className={rootClassNames.join(" ")}
      onTouchStart={(event) => {
        event.preventDefault();
        onCommand(x, y, "start");
      }}
      onTouchMove={(event) => {
        event.preventDefault();
        onCommand(x, y, "move");
      }}
      onTouchEnd={(event) => {
        event.preventDefault();
        onCommand(x, y, "end");
      }}
      onMouseDown={(event) => {
        event.preventDefault();
        onCommand(x, y, "start");
      }}
      onMouseMove={(event) => {
        event.preventDefault();
        onCommand(x, y, "move");
      }}
      onMouseUp={(event) => {
        event.preventDefault();
        onCommand(x, y, "end");
      }}
    >
      <div className="Type">{type}</div>
      <div className="Strength">{strength}</div>
    </div>
  );
}
