import highlightjs from "highlight.js/lib/highlight";
import React from "react";
import ReactDOM from "react-dom";

import App from "devtools/components/App";

// Languages for highlight.js
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";

// Register highlight.js languages
highlightjs.registerLanguage("javascript", javascript);
highlightjs.registerLanguage("json", json);
highlightjs.registerLanguage("yaml", yaml);

// Mode for Code Mirror
// eslint-disable-next-line no-unused-vars
import { Controlled } from "react-codemirror2"; // Imported for side effect
import "codemirror/addon/selection/active-line";
import "codemirror/mode/javascript/javascript";

let root = document.querySelector("#root");

if (!root) {
  root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);

  ["light", "dark"].forEach(theme => {
    const styleLink = document.createElement("link");
    styleLink.setAttribute("href", `${theme}-theme.css`);
    styleLink.setAttribute("rel", "stylesheet");
    styleLink.setAttribute("type", "text/css");
    styleLink.setAttribute("media", `(prefers-color-scheme: ${theme})`);
    document.body.appendChild(styleLink);
  });
}

ReactDOM.render(<App />, root);
