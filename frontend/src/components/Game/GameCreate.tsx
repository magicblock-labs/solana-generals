import * as React from "react";
import { useNavigate } from "react-router-dom";
import { gameCreate } from "../../state/gameCreate";
import { PublicKey } from "@solana/web3.js";
import { Generals } from "../../state/Generals";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export function GameCreate() {
  const navigate = useNavigate();
  const connection = useConnection();
  const wallet = useWallet();

  React.useEffect(() => {
    console.log("GameCreate", "useEffect", wallet);
    if (!wallet.connected) {
      return;
    }
    const generals = new Generals(connection, wallet);
    gameCreate(generals)
      .catch(console.error)
      .then((entityPda: PublicKey) => {
        console.log("entityPda", entityPda);
        if (entityPda) {
          navigate("/game/" + entityPda.toString());
        }
      });
  }, [connection, wallet]);

  return <div>GameCreate</div>;
}
