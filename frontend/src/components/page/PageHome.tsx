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
      setGames(await gameList(engine, 10));
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [engine]);

  return (
    <div className="PageHome Container Centered">
      <div className="Text Title">Home</div>
      <button
        onClick={() => {
          navigate("/game/create");
        }}
      >
        <div className="Text">+ Create a new game +</div>
      </button>
      {games && games.length ? (
        <>
          <div className="Text Title">Latest games</div>
          {games.map(
            ({
              entityPda,
              entityId,
              game,
            }: {
              entityPda: PublicKey;
              entityId: number;
              game: any;
            }) => {
              let status = "?";
              if (game.status.generate) {
                status = "🥚";
              }
              if (game.status.lobby) {
                status = "⏳";
              }
              if (game.status.playing) {
                status = "🪄";
              }
              if (game.status.finished) {
                status = "☠️";
              }

              const code = entityPda.toBase58();
              const num = entityId.toString().padStart(8, "0");

              return (
                <button
                  key={code}
                  className="Soft"
                  onClick={() => {
                    navigate("/game/lobby/" + code);
                  }}
                >
                  <div className="Text">
                    {status} Game {code} (#{num})
                  </div>
                </button>
              );
            }
          )}
        </>
      ) : undefined}
    </div>
  );
}
