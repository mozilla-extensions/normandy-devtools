import cx from "classnames";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { Icon, Panel, Placeholder, Tag } from "rsuite";

import PageWrapper from "devtools/components/common/PageWrapper";
import EnabledTag from "devtools/components/recipes/EnabledTag";
import NamespacePicker from "devtools/components/recipes/NamespacePicker";
import RecipeCard from "devtools/components/recipes/RecipeCard";
import { NAMESPACES } from "devtools/config";
import {
  useSelectedEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  NamespacesProvider,
  useNamespaceInfo,
} from "devtools/contexts/namespaces";
import { RecipeV3 } from "devtools/types/recipes";
import { getSamplingFilterAsNamespaceSample } from "devtools/utils/recipes";

// default export
const NamespacesPage: React.FC = () => {
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  return (
    <NamespacesProvider normandyApi={normandyApi}>
      <PageWrapper>
        <NamespaceListing />
      </PageWrapper>
    </NamespacesProvider>
  );
};

export default NamespacesPage;

const NamespaceListing: React.FC = () => {
  const { selectedKey: selectedEnvironment } = useSelectedEnvironmentState();
  const [selectedNamespace, setSelectedNamespace] = useState(
    NAMESPACES.default,
  );
  const namespacesInfo = useNamespaceInfo();

  const namespaces = namespacesInfo.namespaces;
  namespaces.add(selectedNamespace);

  const handleNamespaceChange = useCallback(
    (value) => {
      setSelectedNamespace(value);
    },
    [setSelectedNamespace],
  );

  const fullBucketCount = namespacesInfo
    .findOccupiedBuckets(selectedNamespace)
    .filter((occupied) => occupied).length;

  useEffect(() => {
    namespacesInfo.updateNamespace(selectedNamespace);
  }, [selectedNamespace, selectedEnvironment]);

  const recipeLists = categorizeRecipes(
    namespacesInfo.recipesByNamespace[selectedNamespace],
  );

  let cards = (
    <div className="grid-layout grid-3 card-grid mt-2">
      <CardPlaceholder />
      <CardPlaceholder />
      <CardPlaceholder />
    </div>
  );
  if (!namespacesInfo.isLoading("updateNamespace", selectedNamespace)) {
    cards = (
      <div className="grid-layout grid-3 card-grid mt-2">
        {recipeLists.ok.map(({ recipe, bucketRange }) => (
          <BucketCard
            key={recipe.id}
            bucketClassName="font-family-monospace"
            recipe={recipe}
          >
            {bucketRange[0]} - {bucketRange[1]}
          </BucketCard>
        ))}
      </div>
    );
  }

  let noRecipesMessage = null;
  if (
    recipeLists.ok.length === 0 &&
    !namespacesInfo.isLoading("updateNamespace", selectedNamespace)
  ) {
    if (recipeLists.backwards.length === 0 && recipeLists.error.length === 0) {
      noRecipesMessage = <>No recipes found</>;
    } else {
      noRecipesMessage = <>No standard formatted recipes found</>;
    }
  }

  return (
    <>
      <div className="d-flex align-items-center">
        <h3>Recipes in Namespace</h3>
        <NamespacePicker
          className="ml-1"
          value={selectedNamespace}
          onChange={handleNamespaceChange}
        />
        {!namespacesInfo.isLoading("updateNamespace", selectedNamespace) && (
          <div className="ml-1">{fullBucketCount / 100}% full</div>
        )}
      </div>

      {noRecipesMessage}
      {cards}

      {!!recipeLists.backwards.length && (
        <>
          <h3 className="mt-1">Recipes with Backwards Inputs</h3>
          <p>
            These recipes share the same namespace name, but have their inputs
            reversed from the standard, and so are in a distinct namespace from
            the above.
          </p>
          <div className="grid-layout grid-3 card-grid mt-2">
            {recipeLists.backwards.map(({ recipe, bucketRange }) => (
              <BucketCard
                key={recipe.id}
                bucketClassName="font-family-monospace"
                recipe={recipe}
              >
                {bucketRange[0]} - {bucketRange[1]}
              </BucketCard>
            ))}
          </div>
        </>
      )}

      {!!recipeLists.error.length && (
        <>
          <h3 className="mt-1">Recipes with Incorrect Filters</h3>
          <p>The sampling filters of these recipes could not be parsed.</p>
          <div className="grid-layout grid-3 card-grid mt-2">
            {recipeLists.error.map(({ recipe, err }) => (
              <BucketCard key={recipe.id} recipe={recipe}>
                <Icon icon="warning" /> {err.toString()}
              </BucketCard>
            ))}
          </div>
        </>
      )}
    </>
  );
};

type CategorizedRecipes = Record<
  "ok" | "backwards" | "error",
  Array<{
    recipe: RecipeV3;
    bucketRange?: [number, number];
    err?: Error;
  }>
>;

export function categorizeRecipes(
  recipes: Array<RecipeV3> = [],
): CategorizedRecipes {
  const recipeLists = {
    ok: [],
    backwards: [],
    error: [],
  };

  for (const recipe of recipes) {
    try {
      const sampleFilter = getSamplingFilterAsNamespaceSample(
        recipe.latest_revision,
      );
      recipeLists.ok.push({
        recipe,
        bucketRange: [
          sampleFilter.start,
          sampleFilter.start + sampleFilter.count,
        ],
      });
    } catch (err) {
      if (
        err instanceof getSamplingFilterAsNamespaceSample.BackwardsInputsError
      ) {
        const backwardsFilter = getSamplingFilterAsNamespaceSample(
          recipe.latest_revision,
          { backwardsInputs: true },
        );
        recipeLists.backwards.push({
          recipe,
          bucketRange: [
            backwardsFilter.start,
            backwardsFilter.start + backwardsFilter.count,
          ],
        });
      } else {
        recipeLists.error.push({ bucketRange: null, recipe, err });
      }
    }
  }

  // Sort by starting bucket, then ending bucket, then recipe id. Error buckets
  // go at the end, and so get +Infinity as start and end values.
  for (const key of Object.keys(recipeLists)) {
    recipeLists[key] = _.sortBy(recipeLists[key], [
      (v) => v.bucketRange?.[0] ?? Infinity,
      (v) => v.bucketRange?.[1] ?? Infinity,
      (v) => v.recipe.id,
    ]);
  }

  return recipeLists;
}

const BucketCard: React.FC<{ recipe: RecipeV3; bucketClassName?: string }> = ({
  recipe,
  children,
  bucketClassName,
}) => {
  return (
    <RecipeCard
      key={recipe.id}
      afterHeader={
        <EnabledTag className="ml-half" revision={recipe.latest_revision} />
      }
      className="mb-1"
      recipe={recipe}
    >
      <div className="mt-2">
        <div className="font-weight-bold">Buckets</div>
        <div className={cx("text-subtle", bucketClassName)}>{children}</div>
      </div>
    </RecipeCard>
  );
};

const CardPlaceholder: React.FC = () => {
  return (
    <Panel bordered alt="Recipe loading" data-testid="recipe-card-placeholder">
      <div className="d-flex font-size-larger">
        <div>
          <Tag className="mt-0 mr-1" color="gray" style={{ width: 25 }}>
            &nbsp;
          </Tag>
        </div>
        <div className="font-weight-bold flex-grow-1">
          <Placeholder.Paragraph active rows={1} />
        </div>
      </div>

      <div className="mt-2">
        <Placeholder.Paragraph active rows={2} />
      </div>
    </Panel>
  );
};
