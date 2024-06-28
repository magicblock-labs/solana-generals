import * as React from "react";

import { MenuWallet } from "./MenuWallet";
import { MenuSession } from "./MenuSession";

import "./MenuBar.scss";
import { useNavigate } from "react-router-dom";

export function MenuBar() {
  const navigate = useNavigate();
  return (
    <div className="MenuBar VStack">
      <div
        className="TitleBar Container"
        onClick={() => {
          navigate("/");
        }}
      >
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
