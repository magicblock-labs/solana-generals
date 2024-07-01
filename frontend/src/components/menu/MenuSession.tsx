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
  }, [engine]);

  const needsFunding =
    sessionLamports !== undefined
      ? sessionLamports < engine.getSessionMinLamports()
      : true;

  const extras = [];
  if (engine.getWalletConnected() && needsFunding) {
    const onFund = () => {
      engine.fundSession().then(() => {
        console.log("funded");
      });
    };
    extras.push(
      <button key="fund" onClick={onFund}>
        <div className="Text">Fund</div>
      </button>
    );
  }
  if (needsFunding) {
    extras.push(
      <div key="warning" className="Text Warning">
        Needs SOL!
      </div>
    );
  }

  const sessionAbbreviation = sessionPayer.toBase58().substring(0, 8);
  const sessionBalance =
    sessionLamports !== undefined
      ? (sessionLamports / 1_000_000_000).toFixed(3)
      : "?????";

  return (
    <div className="MenuSession ContainerInner Centered Horizontal">
      <button
        className="Soft"
        onClick={() => {
          navigator.clipboard.writeText(sessionPayer.toBase58());
        }}
      >
        <div className="Text">
          Player: {sessionAbbreviation}... {sessionBalance} SOL
        </div>
      </button>
      {extras}
    </div>
  );
}
