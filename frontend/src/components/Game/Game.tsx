import * as React from "react";
import { useParams } from "react-router-dom";

import { GameGrid } from "./GameGrid";

export function Game() {
  let params = useParams();
  console.log("params", params);

  return (
    <>
      Game {params.id.toString()}
      <GameGrid></GameGrid>
    </>
  );
}
