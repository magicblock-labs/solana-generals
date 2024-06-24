import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

import { gameCreate } from "../../states/gameCreate";

import "./PageGameCreate.scss";

export function PageGameCreate() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  React.useEffect(() => {
    if (!engine.getConnected()) {
      return;
    }
    gameCreate(engine)
      .catch(console.error)
      .then((entityPda: PublicKey) => {
        console.log("entityPda", entityPda);
        if (entityPda) {
          navigate("/game/play/" + entityPda.toString());
        } else {
          // TODO(vbrunet) - redirect to error page
        }
      });
  }, [engine]);

  return <div className="PageGameCreate">PageGameCreate</div>;
}
