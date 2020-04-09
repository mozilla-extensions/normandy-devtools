import React from "react";
import {
  HashRouter,
  Route,
  NavLink,
  Redirect,
  Switch,
  useRouteMatch,
} from "react-router-dom";
import ErrorBoundary from "react-error-boundary";
import { Icon, Nav, Sidenav } from "rsuite";

import AppHeader from "devtools/components/common/AppHeader";
import RecipesPage from "devtools/components/pages/RecipesPage";
import RecipeEditor from "devtools/components/recipes/RecipeEditor";
import FiltersPage from "devtools/components/pages/FiltersPage";
import PrefStudiesPage from "devtools/components/pages/PrefStudiesPage";
import AddonStudiesPage from "devtools/components/pages/AddonStudiesPage";
import {
  EnvironmentProvider,
  useEnvironmentState,
} from "devtools/contexts/environment";

export default function App(props) {
  return (
    <HashRouter>
      <EnvironmentProvider>
        <div className="app-container">
          <AppHeader />
          <div className="content-wrapper">
            <AppSidebar />
            <Page />
          </div>
        </div>
      </EnvironmentProvider>
    </HashRouter>
  );
}

function AppSidebar() {
  const { selectedKey } = useEnvironmentState();

  return (
    <div className="app-sidebar">
      <Sidenav>
        <Sidenav.Body>
          <Nav vertical>
            <Nav.Item
              componentClass={NavLink}
              to={`/${selectedKey}/recipes`}
              icon={<Icon icon="book" />}
            >
              Recipes
            </Nav.Item>
            <Nav.Item
              componentClass={NavLink}
              to={`/${selectedKey}/filters`}
              icon={<Icon icon="filter" />}
            >
              Filters
            </Nav.Item>
            <Nav.Item
              componentClass={NavLink}
              to={`/${selectedKey}/pref-studies`}
              icon={<Icon icon="table" />}
            >
              Pref Studies
            </Nav.Item>
            <Nav.Item
              componentClass={NavLink}
              to={`/${selectedKey}/addon-studies`}
              icon={<Icon icon="puzzle-piece" />}
            >
              Add-on Studies
            </Nav.Item>
          </Nav>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
}

function Page() {
  const match = useRouteMatch();

  return (
    <div className="page-container">
      <ErrorBoundary>
        <Switch>
          <Route path={`${match.path}/`} exact>
            <Redirect to={`${match.url}/recipes`} />
          </Route>

          <Route
            path={`${match.path}/recipes/edit/:id`}
            component={RecipeEditor}
          />
          <Route path={`${match.path}/recipes/new`} component={RecipeEditor} />
          <Route path={`${match.path}/recipes`} component={RecipesPage} />
          <Route path={`${match.path}/filters`} component={FiltersPage} />
          <Route
            path={`${match.path}/pref-studies`}
            component={PrefStudiesPage}
          />
          <Route
            path={`${match.path}/addon-studies`}
            component={AddonStudiesPage}
          />

          <Route
            render={(args) => (
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
  );
}
