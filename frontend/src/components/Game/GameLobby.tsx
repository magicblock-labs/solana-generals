import * as React from "react";

export function GameLobby({ game }: { game: any }) {
  if (!game) {
    return <div>No game</div>;
  }

  const rows = game.players.map((player: any, index: any) => {
    console.log("player", player, index);
    const ready = player.ready ? "ready" : "empty";
    const authority = player.authority.toBase58();
    return (
      <div key={index}>
        {ready} / {authority}
      </div>
    );
  });

  return (
    <div>
      GameLobby
      <div>{rows}</div>
    </div>
  );
}
