import React from "react";
import { HashRouter, Route, NavLink, Redirect, Switch } from "react-router-dom";
import ErrorBoundary from "react-error-boundary";
import { Icon, Nav, Sidenav } from "rsuite";

import AppHeader from "devtools/components/common/AppHeader";
import RecipesPage from "devtools/components/pages/RecipesPage";
import FiltersPage from "devtools/components/pages/FiltersPage";
import PrefStudiesPage from "devtools/components/pages/PrefStudiesPage";
import AddonStudiesPage from "devtools/components/pages/AddonStudiesPage";
import { EnvironmentProvider } from "devtools/contexts/environment";

export default function App(props) {
  return (
    <HashRouter>
      <EnvironmentProvider>
        <div className="app-container">
          <AppHeader />
          <div className="content-wrapper">
            <div className="app-sidebar">
              <Sidenav>
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
                  </Nav>
                </Sidenav.Body>
              </Sidenav>
            </div>
            <div className="page-container">
              <ErrorBoundary>
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => <Redirect to="/recipes" />}
                  />
                  <Route path="/recipes" component={RecipesPage} />
                  <Route path="/filters" component={FiltersPage} />
                  <Route path="/pref-studies" component={PrefStudiesPage} />
                  <Route path="/addon-studies" component={AddonStudiesPage} />
                  <Route
                    render={args => (
                      <>
                        <span>404</span>
                        <pre>
                          <code>{JSON.stringify(args, null, 4)}</code>
                        </pre>
                      </>
                    )}
                  />
                </Switch>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </EnvironmentProvider>
    </HashRouter>
  );
}
