import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, HashRouter, Link } from "react-router-dom";

import { MagicBlockEngineProvider } from "./engine/MagicBlockEngine";

import { MenuBar } from "./components/menu/MenuBar";

import { PageGamePlay } from "./components/page/PageGamePlay";
import { PageGameCreate } from "./components/page/PageGameCreate";

import "./index.scss";

function App() {
  return (
    <HashRouter>
      <MagicBlockEngineProvider>
        <MenuBar />
        <div>
          <Link to="/">Home</Link>
          <Link to="/dudu">dudu</Link>
          <Link to="/game/create">Game Create</Link>
        </div>
        <div>
          <Routes>
            <Route path="/" element={[]} />
            <Route path="/game/create" element={<PageGameCreate />} />
            <Route path="/game/play/:id" element={<PageGamePlay />} />
          </Routes>
        </div>
      </MagicBlockEngineProvider>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")).render(<App />);
