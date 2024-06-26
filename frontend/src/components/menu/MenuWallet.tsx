import * as React from "react";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import "./MenuWallet.scss";

export function MenuWallet() {
  const engine = useMagicBlockEngine();
  if (engine.getWalletConnected()) {
    return <MenuWalletConnected />;
  } else {
    return <MenuWalletDisconnected />;
  }
}

function MenuWalletConnected() {
  const engine = useMagicBlockEngine();

  const walletPayer = engine.getWalletPayer();

  const [walletLamports, setWalletLamports] = React.useState(0);
  React.useEffect(() => {
    return engine.listeToAccountInfo(walletPayer, (accountInfo) => {
      setWalletLamports(accountInfo?.lamports ?? 0);
    });
  });

  return (
    <div className="MenuWalletConnected">
      <div className="Label"></div>
      <button
        className="Key"
        onClick={() => {
          navigator.clipboard.writeText(walletPayer.toBase58());
        }}
      >
        Wallet: 🔗 {walletPayer.toBase58().substring(0, 8)}... (
        {(walletLamports / 1_000_000_000).toFixed(4)} SOL)
      </button>
      <button
        className="Disconnect"
        onClick={() => {
          engine.selectWalletAdapter(null);
        }}
      >
        X
      </button>
    </div>
  );
}

function MenuWalletDisconnected() {
  const engine = useMagicBlockEngine();

  const walletAdapters = engine.listWalletAdapters();

  return (
    <div className="MenuWalletDisconnected">
      {walletAdapters.length > 0 ? (
        <>
          <div className="Label">Connect:</div>
          {walletAdapters.map((walletAdapter) => {
            return (
              <button
                key={walletAdapter.name}
                className="Adapter"
                onClick={() => {
                  engine.selectWalletAdapter(walletAdapter);
                }}
              >
                <img className="Icon" src={walletAdapter.icon} />
                <div className="Name">{walletAdapter.name.toString()}</div>
              </button>
            );
          })}{" "}
        </>
      ) : (
        <div className="Placeholder">No web wallet detected</div>
      )}
    </div>
  );
}
