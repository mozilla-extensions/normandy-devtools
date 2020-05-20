/* eslint-disable import/order */
import highlightjs from "highlight.js/lib/core";

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
