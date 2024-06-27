import * as React from "react";

import { MenuWallet } from "./MenuWallet";
import { MenuSession } from "./MenuSession";

import "./MenuBar.scss";

export function MenuBar() {
  return (
    <div className="MenuBar VStack">
      <div className="TitleBar">
        <div className="Title">MagicBlock Labs - Generals</div>
      </div>
      <div className="KeysBar HStack">
        <MenuSession />
        <div className="Separator"></div>
        <MenuWallet />
      </div>
    </div>
  );
}
