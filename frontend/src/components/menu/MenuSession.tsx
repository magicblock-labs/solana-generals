import * as React from "react";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import "./MenuSession.scss";

export function MenuSession() {
  const engine = useMagicBlockEngine();

  const sessionPayer = engine.getSessionPayer();

  const [sessionLamports, setSessionLamports] = React.useState(0);
  React.useEffect(() => {
    return engine.listeToAccountInfo(sessionPayer, (accountInfo) => {
      setSessionLamports(accountInfo?.lamports ?? 0);
    });
  });

  const extras = [];
  if (
    engine.getWalletConnected() &&
    sessionLamports < engine.getSessionMinLamports()
  ) {
    const onFund = () => {
      engine.fundSession().then(() => {
        console.log("funded");
      });
    };
    extras.push(
      <button key="fund" className="Fund" onClick={onFund}>
        Fund
      </button>
    );
  } else if (sessionLamports < engine.getSessionMinLamports()) {
    extras.push(
      <div key="warning" className="Warning">
        (Needs SOL!)
      </div>
    );
  }

  return (
    <div className="MenuSession">
      <div className="Label"></div>
      <button
        className="Key"
        onClick={() => {
          navigator.clipboard.writeText(sessionPayer.toBase58());
        }}
      >
        Player: 🔗 {sessionPayer.toBase58().substring(0, 8)}... (
        {(sessionLamports / 1_000_000_000).toFixed(4)} SOL)
      </button>
      {extras}
    </div>
  );
}
