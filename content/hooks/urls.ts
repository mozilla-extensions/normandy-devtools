import React from "react";
import { useLocation } from "react-router";

export function useExtensionUrl(): URL {
  const location = useLocation();
  const url = new URL(`web+normandy:/${location.pathname}`);
  url.search = location.search;
  url.hash = location.hash;
  return url;
}

export function useHistoryRecorder(): void {
  if (DEVELOPMENT) {
    const extensionUrl = useExtensionUrl();
    React.useEffect(() => {
      window.localStorage.setItem(
        "dev-mode-last-page",
        extensionUrl.toString(),
      );
    }, [extensionUrl]);
  }
}
