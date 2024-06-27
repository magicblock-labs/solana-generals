import * as React from "react";

import { useParams } from "react-router-dom";

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
      return <div>Unknown error</div>;
  }
}

export function PageError() {
  const params = useParams();
  return (
    <div className="PageError VStack">
      <PageErrorInner code={params.code} />
    </div>
  );
}
