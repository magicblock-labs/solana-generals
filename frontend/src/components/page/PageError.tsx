import * as React from "react";

import { useNavigate, useParams } from "react-router-dom";

import "./PageError.scss";

function ErrorSessionFail() {
  return <div className="Text">Failed to fetch on-chain accounts</div>;
}

function ErrorNoGame() {
  return <div className="Text">Failed to find the game</div>;
}

function ErrorCreate() {
  return <div className="Text">Failed to create the game</div>;
}

function ErrorUnknown() {
  return <div className="Text">Unknown error</div>;
}

function PageErrorInner({ code }: { code: string }) {
  switch (code) {
    case "create-error":
      return <ErrorCreate />;
    case "lobby-no-game":
      return <ErrorNoGame />;
    case "play-no-game":
      return <ErrorNoGame />;
    case "session-fail":
      return <ErrorSessionFail />;
    default:
      return <ErrorUnknown />;
  }
}

export function PageError() {
  const navigate = useNavigate();
  const params = useParams();
  return (
    <div className="PageError Container Centered">
      <div className="Text Title">Something went wrong</div>
      <PageErrorInner code={params.code} />
      <button
        className="Soft"
        onClick={() => {
          navigate("/");
        }}
      >
        <div className="Text">Go home</div>
      </button>
    </div>
  );
}
