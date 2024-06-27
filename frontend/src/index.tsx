import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, HashRouter, Link } from "react-router-dom";

import { MagicBlockEngineProvider } from "./engine/MagicBlockEngine";

import { MenuBar } from "./components/menu/MenuBar";

import { PageHome } from "./components/page/PageHome";
import { PageGamePlay } from "./components/page/PageGamePlay";
import { PageGameLobby } from "./components/page/PageGameLobby";
import { PageGameCreate } from "./components/page/PageGameCreate";
import { PageError } from "./components/page/PageError";

import "./index.scss";

function App() {
  return (
    <HashRouter>
      <MagicBlockEngineProvider>
        <MenuBar />
        <div className="Content">
          <Routes>
            <Route path="/" element={<PageHome />} />
            <Route path="/game/create" element={<PageGameCreate />} />
            <Route path="/game/lobby/:id" element={<PageGameLobby />} />
            <Route path="/game/play/:id" element={<PageGamePlay />} />
            <Route path="/error/:code" element={<PageError />} />
          </Routes>
        </div>
      </MagicBlockEngineProvider>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")).render(<App />);
