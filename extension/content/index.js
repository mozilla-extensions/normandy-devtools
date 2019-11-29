import highlightjs from "highlight.js/lib/highlight";
import React from "react";
import ReactDOM from "react-dom";

import App from "devtools/components/App";

// Import stylesheet
import "devtools/less/index.less";

// Languages for highlight.js
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";

// Register highlight.js languages
highlightjs.registerLanguage("javascript", javascript);
highlightjs.registerLanguage("json", json);
highlightjs.registerLanguage("yaml", yaml);

let root = document.querySelector("#root");

if (!root) {
  root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
}

ReactDOM.render(<App />, root);
