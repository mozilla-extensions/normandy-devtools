import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  HashRouter,
  Route,
  Redirect,
  Switch,
  useRouteMatch,
} from "react-router-dom";

import AppHeader from "devtools/components/common/AppHeader";
import { AppSidebar } from "devtools/components/common/AppSidebar";
import { ErrorFallbackPage } from "devtools/components/pages/ErrorFallbackPage";
import NotFoundPage from "devtools/components/pages/NotFoundPage";
import { OverviewPage } from "devtools/components/pages/OverviewPage";
import RecipeListingPage from "devtools/components/pages/RecipeListingPage";
import { EnvironmentProvider } from "devtools/contexts/environment";
import { useHistoryRecorder } from "devtools/hooks/urls";

// RecipesPage is not lazy since it is the default route.
const RecipeFormPage = React.lazy(() =>
  import("devtools/components/pages/RecipeFormPage"),
);
const RecipeDetailsPage = React.lazy(() =>
  import("devtools/components/pages/RecipeDetailsPage"),
);
const ExtensionsPage = React.lazy(() =>
  import("devtools/components/pages/ExtensionsPage"),
);
const FiltersPage =
  __ENV__ === "web"
    ? null
    : React.lazy(() => import("devtools/components/pages/FiltersPage"));
const PrefStudiesPage =
  __ENV__ === "web"
    ? null
    : React.lazy(() => import("devtools/components/pages/PrefStudiesPage"));
const AddonStudiesPage =
  __ENV__ === "web"
    ? null
    : React.lazy(() => import("devtools/components/pages/AddonStudiesPage"));

export default function App() {
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

function Page() {
  const match = useRouteMatch();
  useHistoryRecorder();

  return (
    <div className="page-container">
      <ErrorBoundary FallbackComponent={ErrorFallbackPage}>
        <Suspense fallback="">
          <Switch>
            <Route exact path={`${match.path}/`}>
              <Redirect to={`${match.url}/recipes`} />
            </Route>
            <Route
              exact
              component={OverviewPage}
              path={`${match.path}/overview`}
            />
            <Route
              exact
              component={RecipeListingPage}
              path={`${match.path}/recipes`}
            />
            <Route
              exact
              component={RecipeFormPage}
              path={`${match.path}/recipes/new`}
            />
            <Route
              exact
              component={RecipeFormPage}
              path={`${match.path}/recipes/:recipeId/clone`}
            />
            <Route
              exact
              component={RecipeDetailsPage}
              path={`${match.path}/recipes/:recipeId`}
            />
            <Route
              exact
              component={RecipeDetailsPage}
              path={`${match.path}/recipes/:recipeId/revision/:revisionId`}
            />
            <Route
              exact
              component={RecipeFormPage}
              path={`${match.path}/recipes/:recipeId/edit`}
            />
            <Route
              exact
              component={RecipeFormPage}
              path={`${match.path}/recipes/import/:experimenterSlug`}
            />
            <Route
              exact
              component={ExtensionsPage}
              path={`${match.path}/extensions`}
            />
            {__ENV__ === "web" ? null : (
              <>
                <Route
                  exact
                  component={FiltersPage}
                  path={`${match.path}/filters`}
                />
                <Route
                  component={PrefStudiesPage}
                  path={`${match.path}/pref-studies`}
                />
                <Route
                  component={AddonStudiesPage}
                  path={`${match.path}/addon-studies`}
                />
              </>
            )}

            <Route component={NotFoundPage} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
