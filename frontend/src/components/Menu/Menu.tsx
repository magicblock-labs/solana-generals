import * as React from "react";

import { Link } from "react-router-dom";

import { Connect } from "./Connect";

export function Menu() {
  return (
    <div>
      <Connect />
      <div>
        <Link to="/">Home</Link>
        <Link to="/dudu">dudu</Link>
        <Link to="/game/create">Game Create</Link>
      </div>
    </div>
  );
}
