import * as React from "react";

import { PublicKey } from "@solana/web3.js";

import { useNavigate } from "react-router-dom";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { gameList } from "../../states/gameList";

import "./PageHome.scss";

export function PageHome() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  const [games, setGames] = React.useState(undefined);
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setGames(await gameList(engine));
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [engine]);

  return (
    <div className="PageHome VStack">
      <div className="Title">Home</div>
      <button
        className="Create"
        onClick={() => {
          navigate("/game/create");
        }}
      >
        + Create a new game +
      </button>
      {games ? (
        <>
          <div className="Title">Latest games</div>
          {games.map((entityPda: PublicKey) => {
            const code = entityPda.toBase58();
            return (
              <button
                key={code}
                className="Soft"
                onClick={() => {
                  navigate("/game/lobby/" + code);
                }}
              >
                Game {code}
              </button>
            );
          })}
        </>
      ) : undefined}
    </div>
  );
}
