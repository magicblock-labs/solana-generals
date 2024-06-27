import * as React from "react";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import "./MenuSession.scss";

export function MenuSession() {
  const engine = useMagicBlockEngine();

  const sessionPayer = engine.getSessionPayer();

  const [sessionLamports, setSessionLamports] = React.useState(undefined);
  React.useEffect(() => {
    return engine.subscribeToAccountInfo(sessionPayer, (accountInfo) => {
      setSessionLamports(accountInfo?.lamports);
    });
  });

  const needsFunding = sessionLamports
    ? sessionLamports < engine.getSessionMinLamports()
    : false;

  const extras = [];
  if (engine.getWalletConnected() && needsFunding) {
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
  } else if (needsFunding) {
    extras.push(
      <div key="warning" className="Warning">
        (Needs SOL!)
      </div>
    );
  }

  const sessionBalance = sessionLamports
    ? (sessionLamports / 1_000_000_000).toFixed(3)
    : "????";

  return (
    <div className="MenuSession HStack">
      <button
        className="Soft"
        onClick={() => {
          navigator.clipboard.writeText(sessionPayer.toBase58());
        }}
      >
        <div>Player:</div>
        <div>
          🔗 {sessionPayer.toBase58().substring(0, 8)}... ({sessionBalance} SOL)
        </div>
      </button>
      {extras}
    </div>
  );
}
