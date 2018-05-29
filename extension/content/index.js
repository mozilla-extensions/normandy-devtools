import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, NavLink, Redirect } from "react-router-dom";

import "./style.less";
import RecipeViewer from "./RecipeViewer";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.runNormandy = this.runNormandy.bind(this);
  }

  async runNormandy() {
    await browser.experiments.normandy.standardRun();
  }

  render() {
    return (
      <HashRouter>
        <div className="app">
          <header>
            <h1>Normandy Devtools</h1>
            <nav>
              <NavLink to="/recipes">Recipes</NavLink>
            </nav>
          </header>

          <Route exact path="/" render={() => <Redirect to="/recipes" />} />
          <Route
            path="/recipes"
            render={props => <Recipes runNormandy={this.runNormandy} />}
          />
        </div>
      </HashRouter>
    );
  }
}

function Recipes({ runNormandy }) {
  return (
    <div className="content">
      <section>
        <h1>Controls</h1>
        <button onClick={runNormandy}>Run Normandy</button>
      </section>
      <section>
        <RecipeViewer />
      </section>
    </div>
  );
}

let target = document.querySelector("#target");

if (!target) {
  target = document.createElement("div");
  target.setAttribute("id", "target");
  document.body.appendChild(target);
}

ReactDOM.render(<App />, target);
