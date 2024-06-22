import * as React from "react";
import { useNavigate } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";

import { gameCreate } from "../../states/gameCreate";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngine";

export function GameCreate() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  React.useEffect(() => {
    console.log("GameCreate", "useEffect", engine.getWalletPayer()?.toBase58());
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

  return <div>GameCreate</div>;
}
