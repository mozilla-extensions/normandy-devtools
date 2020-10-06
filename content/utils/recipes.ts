import { strict as assert } from "assert";

import { Revision, RecipeV1 } from "devtools/types/recipes";
import { BucketSampleFilterObject } from "types/filters";

export function convertToV1Recipe(
  revision: Revision,
  environmentName,
): RecipeV1 {
  // Normandy client expects a v1-style recipe, but we have a v3-style recipe. Convert it.
  const idSuffix = environmentName !== "prod" ? `-${environmentName}` : "";

  return {
    id: `${revision.recipe.id}${idSuffix}`,
    name: revision.name,
    enabled: revision.enabled,
    is_approved: revision.is_approved,
    revision_id: revision.id,
    action: revision.action.name,
    arguments: revision.arguments,
    filter_expression: revision.filter_expression,
  };
}

/**
 * Brute force a matching client ID for a bucket sample.
 */
export async function bruteForceBucketSample(
  filter: BucketSampleFilterObject,
): Promise<string> {
  for (const input of filter.input) {
    if (
      input !== "normandy.userId" &&
      !(
        (input.startsWith('"') && input.endsWith('"')) ||
        (input.startsWith("'") && input.endsWith("'"))
      )
    ) {
      throw new Error(
        `Can only handle inputs that are constant strings or "normandy.userId". Got "${input}".`,
      );
    }
  }

  // This will probably be enough. For a 1% sample this would fail less than
  // 0.001% of the time. If we regularly hit this, there is a bug.
  const maxTrials = (filter.total / filter.count) * 10;
  for (let i = 0; i < maxTrials; i++) {
    const fakeClientId = `test-userId-${i}`;
    const fakeClientIdStr = `"${fakeClientId}"`;
    const newInput = filter.input.map((inp) =>
      inp === "normandy.userId" ? fakeClientIdStr : inp,
    );
    assert(
      newInput.includes(fakeClientIdStr),
      "Fake client ID not inserted. This is a bug.",
    );

    if (
      await browser.experiments.normandy.bucketSample(
        newInput,
        filter.start,
        filter.count,
        filter.total,
      )
    ) {
      return fakeClientId;
    }
  }

  throw new Error("No matching client found");
}

const _pausableActions = new Set([
  "messaging-experiment",
  "addon-study",
  "opt-out-study",
  "branched-addon-study",
  "multi-preference-experiment",
  "preference-experiment",
]);
export function actionIsPausable(actionName: string): boolean {
  return _pausableActions.has(actionName);
}
