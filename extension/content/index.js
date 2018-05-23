import React from "react";
import ReactDOM from "react-dom";

import "./style.less";
import LogViewer from "./LogViewer";
import RecipeViewer from "./RecipeViewer";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: []
    };

    this.handleLogMessage = this.handleLogMessage.bind(this);
    this.runNormandy = this.runNormandy.bind(this);
  }

  async componentDidMount() {
    browser.experiments.normandy.onNormandyLog.addListener(
      this.handleLogMessage
    );
  }

  componentWillUnmount() {
    browser.experiments.normandy.onNormandyLog.removeListener(
      this.handleLogMessage
    );
  }

  handleLogMessage(message) {
    this.setState(({ messages }) => ({ messages: messages.concat([message]) }));
  }

  async runNormandy() {
    await browser.experiments.normandy.standardRun();
  }

  render() {
    const { messages } = this.state;
    return (
      <div className="app">
        <header>
          <h1>Normandy Devtools</h1>
        </header>

        <div className="content">
          <section>
            <h1>Controls</h1>
            <button onClick={this.runNormandy}>Run Normandy</button>
          </section>
          <section>
            <RecipeViewer />
          </section>
        </div>

        <aside>
          <h2>Log</h2>
          <LogViewer messages={messages} />
        </aside>
      </div>
    );
  }
}

let target = document.querySelector("#target");

if (!target) {
  target = document.createElement("div");
  target.setAttribute("id", "target");
  document.body.appendChild(target);
}

ReactDOM.render(<App />, target);
