import * as React from "react";

import { MenuWallet } from "./MenuWallet";
import { MenuSession } from "./MenuSession";

import "./MenuBar.scss";

export function MenuBar() {
  return (
    <div className="MenuBar">
      <div className="Content">
        <MenuSession />
        <div className="Separator"></div>
        <MenuWallet />
      </div>
      <div className="TitleBar">
        <div className="Title">MagicBlock Labs - Generals</div>
      </div>
    </div>
  );
}
