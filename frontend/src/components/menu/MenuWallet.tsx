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

  const [walletLamports, setWalletLamports] = React.useState(undefined);
  React.useEffect(() => {
    return engine.subscribeToAccountInfo(walletPayer, (accountInfo) => {
      setWalletLamports(accountInfo?.lamports);
    });
  }, [engine]);

  const walletAbbreviation = walletPayer.toBase58().substring(0, 8);
  const walletBalance =
    walletLamports !== undefined
      ? (walletLamports / 1_000_000_000).toFixed(3)
      : "?????";

  return (
    <div className="MenuWalletConnected ContainerInner Centered Horizontal">
      <button
        className="Soft"
        onClick={() => {
          navigator.clipboard.writeText(walletPayer.toBase58());
        }}
      >
        <div className="Text">
          Wallet: {walletAbbreviation}... {walletBalance} SOL
        </div>
      </button>
      <button
        onClick={() => {
          engine.selectWalletAdapter(null);
        }}
      >
        <div className="Text">X</div>
      </button>
    </div>
  );
}

function MenuWalletDisconnected() {
  const engine = useMagicBlockEngine();

  const walletAdapters = engine.listWalletAdapters();

  return (
    <div className="MenuWalletDisconnected ContainerInner Centered Horizontal">
      {walletAdapters.length > 0 ? (
        <>
          <div className="Text">Connect:</div>
          {walletAdapters.map((walletAdapter) => {
            return (
              <button
                key={walletAdapter.name}
                className="Adapter Horizontal"
                onClick={() => {
                  engine.selectWalletAdapter(walletAdapter);
                }}
              >
                <img className="Icon" src={walletAdapter.icon} />
                <div className="Text">{walletAdapter.name.toString()}</div>
              </button>
            );
          })}{" "}
        </>
      ) : (
        <div className="Text">No web wallet detected</div>
      )}
    </div>
  );
}
