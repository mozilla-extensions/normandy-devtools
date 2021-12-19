import React, { useEffect, useState } from "react";
import { Loader, Pagination } from "rsuite";
import { Divider } from "rsuite/es";

import PageWrapper from "devtools/components/common/PageWrapper";
import ListingsHeader from "devtools/components/recipes/listings/ListingsHeader";
import RecipeList from "devtools/components/recipes/listings/RecipeList";
import RecipeQueryEditor from "devtools/components/recipes/listings/RecipeQueryEditor";
import WriteRecipeModal from "devtools/components/recipes/listings/WriteRecipeModal";
import {
  useSelectedEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { RecipeListQuery } from "devtools/types/normandyApi";
import { convertToV1Recipe } from "devtools/utils/recipes";

// Wrapped in a HOC and then exported as default
const RecipeListingPage: React.FC = () => {
  const {
    connectionStatus,
    selectedKey: environmentKey,
  } = useSelectedEnvironmentState();
  const api = useSelectedNormandyEnvironmentAPI();
  const [currentRecipes, setCurrentRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [recipeQuery, setRecipeQuery] = useState<RecipeListQuery>(null);

  const [arbitraryRecipe, setArbitraryRecipe] = useState("");
  const [showWriteRecipes, setShowWriteRecipes] = useState(false);

  // Load recipes
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await api.fetchRecipePage({
        ordering: "-id",
        ...recipeQuery,
      });
      setCurrentRecipes(data.results);
      setCount(data.count);
      setLoading(false);
    })();
  }, [environmentKey, connectionStatus, recipeQuery]);

  function copyRecipeToArbitrary(v3Recipe): void {
    const v1Recipe = convertToV1Recipe(
      v3Recipe.latest_revision,
      environmentKey,
    );
    setArbitraryRecipe(JSON.stringify(v1Recipe, null, 2));
    setShowWriteRecipes(true);
  }

  let recipeList = (
    <div className="text-center mt-4">
      <Loader content="Loading recipes&hellip;" />
    </div>
  );
  if (!loading) {
    recipeList = (
      <RecipeList
        copyRecipeToArbitrary={copyRecipeToArbitrary}
        environmentKey={environmentKey}
        recipes={currentRecipes}
      />
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      <ListingsHeader setShowWriteRecipes={setShowWriteRecipes} />

      <div className="flex-grow-1 overflow-auto">
        <PageWrapper className="pt-3">
          <RecipeQueryEditor
            normandyApi={api}
            query={recipeQuery}
            setQuery={setRecipeQuery}
          />
          <Divider />
          {recipeList}
        </PageWrapper>
      </div>

      <div className="page-footer text-center">
        <Pagination
          boundaryLinks
          ellipsis
          next
          prev
          activePage={recipeQuery?.page ?? 1}
          maxButtons={5}
          pages={Math.ceil(count / 25)}
          size="lg"
          onSelect={(newPage) =>
            setRecipeQuery((q) => ({ ...q, page: newPage }))
          }
        />
      </div>

      <WriteRecipeModal
        arbitraryRecipe={arbitraryRecipe}
        setArbitraryRecipe={setArbitraryRecipe}
        setShowWriteRecipes={setShowWriteRecipes}
        showWriteRecipes={showWriteRecipes}
      />
    </div>
  );
};

export default RecipeListingPage;
