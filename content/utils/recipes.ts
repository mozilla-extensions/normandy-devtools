import { strict as assert } from "assert";

import {
  BucketSampleFilterObject,
  SampleFilterObject,
} from "devtools/types/filters";
import { Revision, RecipeV1 } from "devtools/types/recipes";

export function convertToV1Recipe(
  revision: Revision,
  environmentName,
): RecipeV1 {
  // Normandy client expects a v1-style recipe, but we have a v3-style recipe. Convert it.
  const idSuffix = environmentName !== "prod" ? `-${environmentName}` : "";

  /* eslint-disable @typescript-eslint/camelcase */
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
  /* eslint-enable @typescript-eslint/camelcase */
}

/** Brute force an unending series of matching client IDs for a bucket sample. */
async function* bruteForceSampleMatchesGenerator(
  filter: SampleFilterObject,
): AsyncGenerator<string, never> {
  if (filter.type === "namespaceSample") {
    const newFilter: BucketSampleFilterObject = {
      type: "bucketSample",
      count: filter.count,
      start: filter.start,
      input: [`"${filter.namespace}"`, "normandy.userId"],
      total: 10000,
    };
    filter = newFilter;
  } else if (filter.type === "stableSample") {
    const newFilter: BucketSampleFilterObject = {
      type: "bucketSample",
      count: filter.rate * 10000,
      start: 0,
      input: filter.input,
      total: 10000,
    };
    filter = newFilter;
  }

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
  const maxTrialsStep = (filter.total / filter.count) * 10;
  let maxTrials = maxTrialsStep;

  // maxTrials will be changing over time, this is intended to be an infinite loop.
  for (let i = 0; i < maxTrials; i++) {
    const fakeClientId = `test-userId-${i}`;
    const fakeClientIdStr = `"${fakeClientId}"`;
    const newInput = filter.input.map((inp) => {
      if (inp === "normandy.userId") {
        return fakeClientIdStr;
      }

      return inp;
    });
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
      yield fakeClientId;
      maxTrials = i + maxTrialsStep;
    }
  }

  throw new Error(
    `The next matching client was not found after ${maxTrialsStep} iterations`,
  );
}

/**
 * Brute force a matching client ID for a bucket sample.
 */
export async function bruteForceBucketSample(
  filter: SampleFilterObject,
): Promise<string> {
  const generator = bruteForceSampleMatchesGenerator(filter);
  return (await generator.next()).value;
}

export type RatioInput = {
  [key: string]: unknown;
  slug: string;
  ratio: number;
};

export async function* bruteForceSampleAndBranches(
  filter: SampleFilterObject,
  ratioInputs: Array<RatioInput>,
  branchInputGenerator: (string) => string,
): AsyncGenerator<{ [key: string]: string }, void> {
  const matches = {};

  for (const input of ratioInputs) {
    matches[input.slug] = null;
  }

  yield { ...matches };

  const branchesNeeded = Array.from(Object.keys(ratioInputs)).length;
  const maxDupesAllowed = Math.pow(branchesNeeded, 3);
  let branchesFound = 0;
  let dupesFound = 0;

  let generator;
  if (filter) {
    generator = bruteForceSampleMatchesGenerator(filter);
  } else {
    generator = (function* (): Generator<string> {
      let i = 0;
      while (true) {
        i += 1;
        yield `test-clientId-${i}`;
      }
    })();
  }

  for await (const matchingClientId of generator) {
    const branchInput = branchInputGenerator(matchingClientId);
    const matchedIndex = await browser.experiments.normandy.ratioSample(
      branchInput,
      ratioInputs.map((ri) => ri.ratio),
    );
    const assignedBranch = ratioInputs[matchedIndex].slug;
    if (typeof matches[assignedBranch] === "string") {
      // got this one already, that's ok
      dupesFound += 1;
    } else if (matches[assignedBranch] === null) {
      // found a new match, great!
      matches[assignedBranch] = matchingClientId;
      yield { ...matches };
      branchesFound += 1;
    } else {
      // This seems like an error
      throw new Error(
        `Matched into unexpected branch ${assignedBranch}. ` +
          `Expected one of ${JSON.stringify(ratioInputs.map((ri) => ri.slug))}`,
      );
    }

    if (branchesFound >= branchesNeeded) {
      return;
    }

    if (dupesFound >= maxDupesAllowed) {
      throw new Error("Too many duplicates found");
    }
  }
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
