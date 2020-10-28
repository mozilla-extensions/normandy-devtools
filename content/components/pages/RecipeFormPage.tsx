import React from "react";
import { useParams } from "react-router-dom";

import PageWrapper from "devtools/components/common/PageWrapper";
import NotFoundPage from "devtools/components/pages/NotFoundPage";
import { INITIAL_ACTION_ARGUMENTS } from "devtools/components/recipes/form/ActionArguments";
import RecipeForm from "devtools/components/recipes/form/RecipeForm";
import RecipeFormHeader from "devtools/components/recipes/form/RecipeFormHeader";
import {
  useEnvironmentState,
  useSelectedExperimenterEnvironmentAPI,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  INITIAL_RECIPE_DATA,
  RecipeDetailsProvider,
} from "devtools/contexts/recipeDetails";

// export default
const RecipeFormPage: React.FC = () => {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const [data, setData] = React.useState({});
  const [importInstructions, setImportInstructions] = React.useState("");
  const { recipeId: recipeIdStr, experimenterSlug } = useParams<{
    recipeId: string;
    experimenterSlug: string;
  }>();

  let recipeId;
  if (recipeIdStr) {
    recipeId = parseInt(recipeIdStr);
    if (isNaN(recipeId)) {
      return (
        <NotFoundPage>
          Invalid recipe ID <code>{JSON.stringify(recipeIdStr)}</code>
        </NotFoundPage>
      );
    }
  }

  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterApi = useSelectedExperimenterEnvironmentAPI();

  React.useEffect(() => {
    if (recipeId) {
      normandyApi.fetchRecipe(recipeId).then((recipeData) => {
        setData(recipeData.latest_revision);
        setImportInstructions("");
      });
    } else if (experimenterSlug) {
      normandyApi.fetchAllActions().then((actions) => {
        experimenterApi
          .fetchRecipe(experimenterSlug)
          .then(({ comment, action_name, ...recipeData }) => {
            setData({
              ...recipeData,
              arguments: {
                ...INITIAL_ACTION_ARGUMENTS[action_name],
                ...recipeData.arguments,
              },
              action: actions.find((a) => a.name === action_name),
            });
            setImportInstructions(comment);
          });
      });
    } else {
      setData(INITIAL_RECIPE_DATA);
      setImportInstructions("");
    }
  }, [recipeId, experimenterSlug, environmentKey]);

  return (
    <RecipeDetailsProvider data={data} importInstructions={importInstructions}>
      <div className="d-flex flex-column h-100">
        <RecipeFormHeader />
        <div className="flex-grow-1 overflow-auto">
          <PageWrapper>
            <RecipeForm />
          </PageWrapper>
        </div>
      </div>
    </RecipeDetailsProvider>
  );
};

export default RecipeFormPage;
