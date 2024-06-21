import { PublicKey } from "@solana/web3.js";
import { Generals } from "./Generals";

export function gameListen(
  generals: Generals,
  id: string,
  setGame: ({}) => void
) {
  try {
    const entityPda = new PublicKey(id);
    const connection = generals.getConnection();
    const subscriptionId = connection.onAccountChange(
      entityPda,
      (account: {}) => {
        console.log("account", account);
        setGame(account);
      }
    );
    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  } catch (error) {
    console.log("error", error);
  }
}
