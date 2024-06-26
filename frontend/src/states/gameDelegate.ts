import { PublicKey, Transaction } from "@solana/web3.js";
import { createDelegateInstruction } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGame } from "./gamePrograms";

export async function gameDelegate(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  const delegateComponentInstruction = createDelegateInstruction({
    entity: entityPda,
    account: gamePda,
    ownerProgram: getComponentGame(engine).programId,
    payer: engine.getSessionPayer(),
  });
  await engine.processSessionTransaction(
    "DelegateComponent",
    new Transaction().add(delegateComponentInstruction),
    false
  );
}
