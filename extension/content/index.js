import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, NavLink, Redirect } from "react-router-dom";
import ErrorBoundary from "react-error-boundary";
import { Container, Icon, Nav, Sidebar, Sidenav } from "rsuite";

import "devtools/less/index.less";

// Mode and theme for Code Mirror
import "codemirror/addon/selection/active-line";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/neo.css";

import Logo from "devtools/components/svg/Logo";
import RecipesPage from "devtools/components/pages/RecipesPage";
import FiltersPage from "devtools/components/pages/FiltersPage";
import PrefStudiesPage from "devtools/components/pages/PrefStudiesPage";
import AddonStudiesPage from "devtools/components/pages/AddonStudiesPage";
import RecipeTimelinePage from "devtools/components/pages/RecipeTimelinePage";

class App extends React.Component {
  render() {
    return (
      <HashRouter>
        <Container className="app-container">
          <Sidebar className="app-sidebar">
            <Sidenav>
              <Sidenav.Header>
                <div className="logo">
                  <Logo />
                  Normandy Devtools
                </div>
              </Sidenav.Header>
              <Sidenav.Body>
                <Nav vertical>
                  <Nav.Item
                    componentClass={NavLink}
                    to="/recipes"
                    icon={<Icon icon="book" />}
                  >
                    Recipes
                  </Nav.Item>
                  <Nav.Item
                    componentClass={NavLink}
                    to="/filters"
                    icon={<Icon icon="filter" />}
                  >
                    Filters
                  </Nav.Item>
                  <Nav.Item
                    componentClass={NavLink}
                    to="/pref-studies"
                    icon={<Icon icon="table" />}
                  >
                    Pref Studies
                  </Nav.Item>
                  <Nav.Item
                    componentClass={NavLink}
                    to="/addon-studies"
                    icon={<Icon icon="puzzle-piece" />}
                  >
                    Add-on Studies
                  </Nav.Item>
                  <Nav.Item
                    componentClass={NavLink}
                    to="/recipe-timeline"
                    icon={<Icon icon="road" />}
                  >
                    Recipe Timeline
                  </Nav.Item>
                </Nav>
              </Sidenav.Body>
            </Sidenav>
          </Sidebar>
          <Container className="page-container">
            <ErrorBoundary>
              {/* <Route exact path="/" render={() => <Redirect to="/recipes" />} /> */}
              <Route
                exact
                path="/"
                render={() => <Redirect to="/recipe-timeline" />}
              />
              <Route path="/recipes" component={RecipesPage} />
              <Route path="/filters" component={FiltersPage} />
              <Route path="/pref-studies" component={PrefStudiesPage} />
              <Route path="/addon-studies" component={AddonStudiesPage} />
              <Route path="/recipe-timeline" component={RecipeTimelinePage} />
            </ErrorBoundary>
          </Container>
        </Container>
      </HashRouter>
    );
  }
}

let root = document.querySelector("#root");

if (!root) {
  root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.appendChild(root);
}

ReactDOM.render(<App />, root);
