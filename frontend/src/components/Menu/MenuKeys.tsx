import * as React from "react";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { Wallet } from "@solana/wallet-adapter-react";

import "./MenuKeys.scss";

function KeyWalletSelector() {
  const engine = useMagicBlockEngine();
  const wallets = engine.listWallets();
  if (wallets.length <= 0) {
    return <>No wallets!</>;
  }
  const onSelect = (wallet: Wallet) => {
    engine.selectWallet(wallet);
  };
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

function KeyWalletReady() {
  const engine = useMagicBlockEngine();

  const publicKey = engine.getWalletPayer();

  const [lamports, setLamports] = React.useState(0);
  React.useEffect(() => {
    return engine.listeToAccountInfo(publicKey, (accountInfo) => {
      setLamports(accountInfo?.lamports ?? 0);
    });
  });

  const onDisconnect = () => {
    engine.selectWallet(null);
  };
  return (
    <div>
      <div className="Key">Wallet: {engine.getWalletPayer()?.toBase58()}</div>
      <div className="Lamports">{lamports / 1_000_000_000} SOL</div>
      <button onClick={onDisconnect}>Disconnect</button>
    </div>
  );
}

function KeyWallet() {
  const engine = useMagicBlockEngine();

  const [selecting, setSelecting] = React.useState(false);
  const onConnect = () => {
    setSelecting(true);
  };

  if (engine.getWalletPayer() == null) {
    if (selecting) {
      return <KeyWalletSelector />;
    }
    return (
      <>
        <button onClick={onConnect}>Connect</button>
      </>
    );
  }
  return <KeyWalletReady />;
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

  const buttons = [];
  if (
    engine.getWalletConnected() &&
    lamports < engine.getSessionMinLamports()
  ) {
    const onFund = () => {
      engine.fundSession().then(() => {
        console.log("funded");
      });
    };
    buttons.push(
      <button key="fund" onClick={onFund}>
        Fund
      </button>
    );
  }
  if (engine.getWalletConnected() && lamports > 5_000) {
    const onDefund = () => {
      engine.defundSession().then(() => {
        console.log("defunded");
      });
    };
    buttons.push(
      <button key="defund" onClick={onDefund}>
        Defund
      </button>
    );
  }

  return (
    <>
      {buttons}
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
