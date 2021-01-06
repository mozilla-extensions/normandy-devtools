import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "rsuite";

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
  const [data, setData] = React.useState(INITIAL_RECIPE_DATA);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
      });
    } else if (experimenterSlug) {
      normandyApi.fetchAllActions().then((actions) => {
        experimenterApi
          .fetchRecipe(experimenterSlug)
          .then(({ comment, action_name, ...recipeData }) => {
            setData({
              ...INITIAL_RECIPE_DATA,
              ...recipeData,
              arguments: {
                ...INITIAL_ACTION_ARGUMENTS[action_name],
                ...recipeData.arguments,
              },
              action: actions.find((a) => a.name === action_name),
            });
            setImportInstructions(comment);
            setLoading(false);
          });
      });
    } else {
      setData(INITIAL_RECIPE_DATA);
      setImportInstructions("");
      setLoading(false);
    }
  }, [recipeId, experimenterSlug, environmentKey]);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Loader content="Loading recipe&hellip;" />
      </div>
    );
  }

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
