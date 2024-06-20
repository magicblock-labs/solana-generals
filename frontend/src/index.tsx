import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, Routes, HashRouter, Link } from "react-router-dom";
import { Game } from "./components/Game/Game";
import { Menu } from "./components/Menu/Menu";

import "./index.scss";

function App() {
  return (
    <HashRouter>
      <div>
        <Link to="/">Home</Link>
        <Link to="/game/4242">Game 4242</Link>
      </div>
      <div background-color="red">
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/game/:id" element={<Game />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
