import * as React from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, HashRouter } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { Menu } from "./components/menu/Menu";
import { GamePlay } from "./components/game/GamePlay";
import { GameCreate } from "./components/game/GameCreate";

import "./index.scss";
import { clusterApiUrl } from "@solana/web3.js";

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = React.useMemo(() => clusterApiUrl(network), [network]);

  return (
    <HashRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]} autoConnect>
          <Menu />
          <div>
            <Routes>
              <Route path="/" element={[]} />
              <Route path="/game/create" element={<GameCreate />} />
              <Route path="/game/play/:id" element={<GamePlay />} />
            </Routes>
          </div>
        </WalletProvider>
      </ConnectionProvider>
    </HashRouter>
  );
}

createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
