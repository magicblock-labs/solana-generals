import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, HashRouter } from "react-router-dom";

import { MagicBlockEngineProvider } from "./engine/MagicBlockEngine";

import { Menu } from "./components/menu/Menu";

import { PageGamePlay } from "./components/page/PageGamePlay";
import { PageGameCreate } from "./components/page/PageGameCreate";

import "./index.scss";

function App() {
  return (
    <HashRouter>
      <MagicBlockEngineProvider>
        <Menu />
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

createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
