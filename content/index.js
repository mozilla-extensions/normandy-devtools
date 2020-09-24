import React from "react";
import ReactDOM from "react-dom";

import App from "devtools/components/App";

import "devtools/side-effects";

let root = document.querySelector("#root");

if (!root) {
  root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);

  // To help with FOUC
  const style = document.createElement("style");
  style.innerHTML = "#root { display: none }";
  document.body.appendChild(style);

  ["light", "dark"].forEach((theme) => {
    const styleLink = document.createElement("link");
    styleLink.setAttribute("href", `${theme}-theme.css`);
    styleLink.setAttribute("rel", "stylesheet");
    styleLink.setAttribute("type", "text/css");
    styleLink.setAttribute("media", `(prefers-color-scheme: ${theme})`);
    document.body.appendChild(styleLink);
  });
}

ReactDOM.render(<App />, root);
