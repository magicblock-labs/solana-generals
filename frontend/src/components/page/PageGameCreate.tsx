import * as React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

import {
  MagicBlockEngine,
  useMagicBlockEngine,
} from "../../engine/MagicBlockEngine";

import { gameCreate } from "../../states/gameCreate";

import "./PageGameCreate.scss";

export function PageGameCreate() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  const [logs, setLogs] = React.useState([]);

  React.useEffect(() => {
    const lastLogs: string[] = [];
    return onPageStartup(navigate, engine, (log) => {
      lastLogs.push(log);
      setLogs([...lastLogs]);
    });
  }, [navigate, engine]);

  return (
    <div className="PageGameCreate VStack">
      <div className="Title">Creating a new game</div>
      <div className="Hint">This can take a few moments...</div>
      <div className="Logs Container VStack">
        {logs.map((log: string, index: number) => {
          return (
            <div key={index} className="Log">
              {log}...
            </div>
          );
        })}
      </div>
    </div>
  );
}

function onPageStartup(
  navigate: NavigateFunction,
  engine: MagicBlockEngine,
  log: (msg: string) => void
) {
  // Wait until page has finished loading to start the PDA creation process
  // Since that process cannot be cancelled, we run it in a timeout
  const timeout = setTimeout(async () => {
    try {
      const entityPda = await gameCreate(engine, log);
      return navigate("/game/lobby/" + entityPda.toBase58());
    } catch (error) {
      console.log("create-error", error);
      return navigate("/error/create-error");
    }
  }, 1000);
  return () => {
    clearTimeout(timeout);
  };
}
