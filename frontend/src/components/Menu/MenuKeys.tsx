import * as React from "react";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { Wallet } from "@solana/wallet-adapter-react";

import "./MenuKeys.scss";

function KeyWallet() {
  const engine = useMagicBlockEngine();

  const [selecting, setSelecting] = React.useState(false);
  const onConnect = () => {
    setSelecting(true);
  };
  const onSelect = (wallet: Wallet) => {
    engine.selectWallet(wallet);
    setSelecting(false);
  };

  if (engine.getWalletPayer() == null) {
    if (selecting) {
      const wallets = engine.listWallets();
      if (wallets.length <= 0) {
        return <>No wallets!</>;
      }
      console.log("wallets", wallets);
      return (
        <>
          wallets:
          {wallets.map((wallet) => {
            const name = wallet.adapter.name;
            return (
              <div
                key={name}
                onClick={() => {
                  onSelect(wallet);
                }}
              >
                {wallet.adapter.name.toString()}
                <img src={wallet.adapter.icon} />
              </div>
            );
          })}
        </>
      );
    }
    return (
      <>
        <button onClick={onConnect}>Connect</button>
      </>
    );
  }

  const onDisconnect = () => {
    engine.selectWallet(null);
  };
  return (
    <div>
      <div className="Key">Wallet: {engine.getWalletPayer()?.toBase58()}</div>
      <button onClick={onDisconnect}>Disconnect</button>
    </div>
  );
}

function KeySession() {
  const engine = useMagicBlockEngine();

  const publicKey = engine.getSessionPayer();

  const [lamports, setLamports] = React.useState(0);
  React.useEffect(() => {
    return engine.listeToAccountInfo(publicKey, (accountInfo) => {
      setLamports(accountInfo?.lamports ?? 0);
    });
  });

  let fundButton;
  if (engine.getConnected() && lamports < engine.getSessionMinimalLamports()) {
    const onFund = () => {
      engine.fundSession();
    };
    fundButton = <button onClick={onFund}>Fund</button>;
  }

  return (
    <>
      {fundButton}
      <div className="Lamports">{lamports / 1_000_000_000} SOL</div>
      <div className="Key">Session: {publicKey.toBase58()}</div>
    </>
  );
}

export function MenuKeys() {
  return (
    <div className="MenuWallets">
      <KeyWallet />
      <KeySession />
    </div>
  );
}
