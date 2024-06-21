import * as React from "react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export function Connect() {
  return (
    <>
      <WalletModalProvider>
        <WalletMultiButton />
        <h1>Hello Solana</h1>
      </WalletModalProvider>
    </>
  );
}
