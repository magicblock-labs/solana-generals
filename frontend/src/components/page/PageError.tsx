import * as React from "react";

import { useNavigate, useParams } from "react-router-dom";

import "./PageError.scss";

function ErrorSessionFail() {
  return <div className="Title">Failed to fetch on-chain information</div>;
}

function ErrorNoGame() {
  return <div className="Title">Failed to find the game</div>;
}

function ErrorCreate() {
  return <div className="Title">Failed to create the game</div>;
}

function ErrorUnknown() {
  return <div className="Title">Unknown error</div>;
}

function PageErrorInner({ code }: { code: string }) {
  switch (code) {
    case "session-fail":
      return <ErrorSessionFail />;
    case "lobby-no-game":
      return <ErrorNoGame />;
    case "session-fail":
      return <ErrorNoGame />;
    case "create-error":
      return <ErrorCreate />;
    default:
      return <ErrorUnknown />;
  }
}

export function PageError() {
  const navigate = useNavigate();
  const params = useParams();
  return (
    <div className="PageError VStack">
      <div className="Title">Error</div>
      <PageErrorInner code={params.code} />
      <button
        className="Soft"
        onClick={() => {
          navigate("/");
        }}
      >
        Go home
      </button>
    </div>
  );
}
