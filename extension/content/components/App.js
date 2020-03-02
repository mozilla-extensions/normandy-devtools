import React from "react";
import { HashRouter, Route, NavLink, Redirect, Switch } from "react-router-dom";
import ErrorBoundary from "react-error-boundary";
import { Container, Icon, Nav, Sidebar, Sidenav } from "rsuite";

import DevtoolsAddressBar from "devtools/components/common/DevtoolsAddressBar";
import Logo from "devtools/components/svg/Logo";
import RecipesPage from "devtools/components/pages/RecipesPage";
import FiltersPage from "devtools/components/pages/FiltersPage";
import PrefStudiesPage from "devtools/components/pages/PrefStudiesPage";
import AddonStudiesPage from "devtools/components/pages/AddonStudiesPage";

export default class App extends React.Component {
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
                </Nav>
              </Sidenav.Body>
            </Sidenav>
          </Sidebar>
          <Container className="page-container">
            <ErrorBoundary>
              <DevtoolsAddressBar />
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
                  // url encoded url like "ext+normandy://page"
                  path={/\/ext%2Bnormandy%3a(?:%2F)*(.*)/i}
                  render={({ match }) => (
                    <>
                      <Redirect
                        to={"/" + decodeURIComponent(match.params["0"])}
                      />
                    </>
                  )}
                />
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
          </Container>
        </Container>
      </HashRouter>
    );
  }
}
