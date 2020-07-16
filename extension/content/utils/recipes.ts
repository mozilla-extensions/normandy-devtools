import { strict as assert } from "assert";

import { BucketSampleFilterObject } from "types/filters";

export function convertToV1Recipe(
  v3Recipe,
  environmentName,
): Record<string, any> {
  // Normandy client expects a v1-style recipe, but we have a v3-style recipe. Convert it.
  const idSuffix = environmentName !== "prod" ? `-${environmentName}` : "";

  /* eslint-disable @typescript-eslint/camelcase */
  return {
    id: `${v3Recipe.id}${idSuffix}`,
    name: v3Recipe.latest_revision.name,
    enabled: v3Recipe.latest_revision.enabled,
    is_approved: v3Recipe.latest_revision.is_approved,
    revision_id: v3Recipe.latest_revision.id,
    action: v3Recipe.latest_revision.action.name,
    arguments: v3Recipe.latest_revision.arguments,
    filter_expression: v3Recipe.latest_revision.filter_expression,
  };
  /* eslint-enable @typescript-eslint/camelcase */
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
