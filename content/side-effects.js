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
/*
 Note: We must import "react-codemirror2" for some side effects that allow the
 addon(s) and mode(s) to be installed.
 */
import "react-codemirror2";
import "codemirror/addon/selection/active-line";
import "codemirror/mode/javascript/javascript";
