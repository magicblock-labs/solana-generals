import { PublicKey } from "@solana/web3.js";
import * as React from "react";

export function GameGrid({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  if (!game) {
    return <div>No game</div>;
  }
  const rows = [];
  for (let y = 0; y < game.sizeY; y++) {
    const cells = [];
    for (let x = 0; x < game.sizeX; x++) {
      const cell = game.cells[y * game.sizeX + x];

      let type = "??";
      if (cell.kind.field) {
        type = "field";
      }
      if (cell.kind.montain) {
        type = "montain";
      }
      if (cell.kind.city) {
        type = "city";
      }
      if (cell.kind.capital) {
        type = "capital";
      }

      let owner = "??";
      if (cell.owner.nobody) {
        owner = "nobody";
      }
      if (cell.owner.player) {
        owner = "player:" + cell.owner.player[0];
      }

      let strength = cell.strength.toString();

      cells.push(
        <div key={y + ":" + x} style={{ flexShrink: 1 }}>
          {type} / {strength} / {owner}
        </div>
      );
    }
    rows.push(
      <div key={y} style={{ flexDirection: "row" }}>
        {cells}
      </div>
    );
  }
  return (
    <div>
      GameGrid
      <div style={{ display: "flex", flexDirection: "column" }}>{rows}</div>
    </div>
  );
}
