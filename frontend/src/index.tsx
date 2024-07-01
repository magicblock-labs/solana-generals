import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, HashRouter, Link } from "react-router-dom";

import { MagicBlockEngineProvider } from "./engine/MagicBlockEngine";

import { MenuBar } from "./components/menu/MenuBar";

import { PageHome } from "./components/page/PageHome";
import { PageGameCreate } from "./components/page/PageGameCreate";
import { PageGameLobby } from "./components/page/PageGameLobby";
import { PageGamePlay } from "./components/page/PageGamePlay";
import { PageError } from "./components/page/PageError";

import "./index.scss";

function App() {
  return (
    <HashRouter>
      <MagicBlockEngineProvider>
        <MenuBar />
        <div className="Content">
          <div style={{ maxWidth: 1024 }}>
            <Routes>
              <Route path="/" element={<PageHome />} />
              <Route path="/game/create" element={<PageGameCreate />} />
              <Route path="/game/lobby/:id" element={<PageGameLobby />} />
              <Route path="/game/play/:id" element={<PageGamePlay />} />
              <Route path="/error/:code" element={<PageError />} />
            </Routes>
          </div>
        </div>
      </MagicBlockEngineProvider>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")).render(<App />);
