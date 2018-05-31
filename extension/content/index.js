import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, NavLink, Redirect } from "react-router-dom";
import ErrorBoundary from "react-error-boundary";

import "./style.less";
import RecipesPage from "./RecipesPage";
import FiltersPage from "./FiltersPage";

class App extends React.Component {
  render() {
    return (
      <HashRouter>
        <div className="app">
          <header>
            <h1>Normandy Devtools</h1>
            <nav>
              <NavLink to="/recipes">Recipes</NavLink>
              <NavLink to="/filters">Filters</NavLink>
            </nav>
          </header>

          <ErrorBoundary>
            <Route exact path="/" render={() => <Redirect to="/recipes" />} />
            <Route path="/recipes" component={RecipesPage} />
            <Route path="/filters" component={FiltersPage} />
          </ErrorBoundary>
        </div>
      </HashRouter>
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
