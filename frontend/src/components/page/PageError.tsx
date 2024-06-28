import * as React from "react";

import { useNavigate, useParams } from "react-router-dom";

import "./PageError.scss";

function ErrorSessionFail() {
  return <div className="Message">Failed to fetch on-chain accounts</div>;
}

function ErrorNoGame() {
  return <div className="Message">Failed to find the game</div>;
}

function ErrorNotGenerated() {
  return <div className="Message">Game wasn't properly initialized</div>;
}

function ErrorCreate() {
  return <div className="Message">Failed to create the game</div>;
}

function ErrorUnknown() {
  return <div className="Message">Unknown error</div>;
}

function PageErrorInner({ code }: { code: string }) {
  switch (code) {
    case "create-error":
      return <ErrorCreate />;
    case "lobby-no-game":
      return <ErrorNoGame />;
    case "lobby-not-generated":
      return <ErrorNotGenerated />;
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
