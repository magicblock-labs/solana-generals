import * as React from "react";

import { Link } from "react-router-dom";

import { MenuKeys } from "./MenuKeys";

export function Menu() {
  return (
    <div>
      <MenuKeys />
      <div>
        <Link to="/">Home</Link>
        <Link to="/dudu">dudu</Link>
        <Link to="/game/create">Game Create</Link>
      </div>
    </div>
  );
}
