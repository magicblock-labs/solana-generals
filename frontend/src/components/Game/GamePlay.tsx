import * as React from "react";
import { useParams } from "react-router-dom";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { gameListen } from "../../state/gameListen";

import { GameGrid } from "./GameGrid";
import { Generals } from "../../state/Generals";

export function GamePlay() {
  let params = useParams();
  console.log("params", params);

  const [game, setGame] = React.useState(null);

  const connection = useConnection();
  const wallet = useWallet();

  React.useEffect(() => {
    const generals = new Generals(connection, wallet);
    return gameListen(generals, params.id, setGame);
  }, [params.id, connection, wallet]);

  console.log("game", game);

  return (
    <>
      Game: {params.id.toString()}
      Game: {game.toString()}
      <GameGrid></GameGrid>
    </>
  );
}
