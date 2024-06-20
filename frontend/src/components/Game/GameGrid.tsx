import * as React from "react";
import * as web3 from "@solana/web3.js";

async function test() {
  let keypair = web3.Keypair.generate();
  let payer = web3.Keypair.generate();
  let connection = new web3.Connection(web3.clusterApiUrl("testnet"));

  let airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  console.log("airdropSignature", airdropSignature);
  const result = await connection.confirmTransaction(airdropSignature);
  console.log("result", result);
}

export function GameGrid() {
  React.useEffect(() => {
    const dudu = test();
    return () => {};
  }, []);

  return <div>GameGrid</div>;
}
