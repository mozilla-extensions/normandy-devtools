import React from "react";
import { useLocation } from "react-router";

export function useExtensionUrl(): URL {
  const location = useLocation();
  const url = new URL(`ext+normandy:/${location.pathname}`);
  url.search = location.search;
  url.hash = location.hash;
  return url;
}

export function useHistoryRecorder(): void {
  if (__BUILD__.isDevelopment) {
    const extensionUrl = useExtensionUrl();
    React.useEffect(() => {
      window.localStorage.setItem(
        "dev-mode-last-page",
        extensionUrl.toString(),
      );
    }, [extensionUrl]);
  }
}
