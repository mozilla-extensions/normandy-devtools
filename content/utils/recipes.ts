import { strict as assert } from "assert";

import { SAMPLING_FILTER_TYPES } from "devtools/constants";
import {
  BucketSampleFilterObject,
  FilterObject,
  NamespaceSampleFilterObject,
  SampleFilterObject,
} from "devtools/types/filters";
import { Revision, RecipeV1 } from "devtools/types/recipes";

export function convertToV1Recipe(
  revision: Revision,
  environmentName: string,
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
      typeof input !== "string" ||
      (input !== "normandy.userId" &&
        !(
          (input.startsWith('"') && input.endsWith('"')) ||
          (input.startsWith("'") && input.endsWith("'"))
        ))
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

export function revisionIsPausable(
  revision: Revision,
): revision is Revision<{ isEnrollmentPaused: boolean }> {
  return actionIsPausable(revision.action.name);
}

export function getNamespaceForFilter(
  filter: SampleFilterObject,
): string | null {
  if (filter.type === "namespaceSample") {
    return filter.namespace;
  } else if (filter.type === "stableSample" || filter.type === "bucketSample") {
    if (filter.input.length !== 2) {
      return null;
    }

    for (const input of filter.input) {
      if (
        input !== "normandy.userId" &&
        typeof input === "string" &&
        ((input.startsWith('"') && input.endsWith('"')) ||
          (input.startsWith("'") && input.endsWith("'")))
      ) {
        return input.replace(/^['"]/, "").replace(/['"]$/, "");
      }
    }
  }

  return null;
}

/**
 * Returns a namespace sample filter associated with a revision. Will convert
 * bucket sample and simple sample recipes to a compatible format, if possible.
 *
 * An error that is of a unique class (instanceof can be used) will be thrown
 * in any of these cases:
 *
 *  - No sampling filters are found.
 *  - More than one filter is found.
 *  - A filter is found, but conversion to a namespace filter is not possible.
 */
export function getSamplingFilterAsNamespaceSample(
  revision: Revision,
  { backwardsInputs = false } = {},
): NamespaceSampleFilterObject {
  const samplingFilters = revision.filter_object.filter(isSamplingFilter);

  if (samplingFilters.length > 1) {
    throw new getSamplingFilterAsNamespaceSample.TooManySampleFiltersError();
  } else if (samplingFilters.length < 1) {
    throw new getSamplingFilterAsNamespaceSample.NoSampleFilterError();
  }

  let samplingFilter: SampleFilterObject = samplingFilters[0] as SampleFilterObject;
  if (samplingFilter.type === "stableSample") {
    // convert to bucket sample
    samplingFilter = {
      type: "bucketSample",
      start: 0,
      count: 10_000 * samplingFilter.rate,
      total: 10_000,
      input: samplingFilter.input,
    };
  }

  if (samplingFilter.type === "bucketSample") {
    if (samplingFilter.input.length !== 2) {
      throw new getSamplingFilterAsNamespaceSample.WrongNumberOfInputsError();
    }

    const namespaceIdx = !backwardsInputs ? 0 : 1;
    const userIdx = !backwardsInputs ? 1 : 0;

    if (
      typeof samplingFilter.input[userIdx] === "string" &&
      (samplingFilter.input[userIdx] as string).match(/(^'.*'$)|(^".*"$)/) &&
      samplingFilter.input[namespaceIdx] === "normandy.userId"
    ) {
      throw new getSamplingFilterAsNamespaceSample.BackwardsInputsError();
    }

    if (
      typeof samplingFilter.input[namespaceIdx] === "string" &&
      !(samplingFilter.input[namespaceIdx] as string).match(/^(['"]).*\1$/)
    ) {
      throw new getSamplingFilterAsNamespaceSample.NotANamespaceIdError();
    }

    if (samplingFilter.input[userIdx] !== "normandy.userId") {
      throw new getSamplingFilterAsNamespaceSample.NotAUserIdError();
    }

    if (samplingFilter.total !== 10_000) {
      throw new getSamplingFilterAsNamespaceSample.WrongTotalError();
    }

    if (samplingFilter.input.some((i) => typeof i !== "string")) {
      throw new getSamplingFilterAsNamespaceSample.NonStringInputError();
    }

    samplingFilter = {
      type: "namespaceSample",
      start: samplingFilter.start,
      count: samplingFilter.count,
      // cast is safe since non-string inputs are rejected above
      namespace: (samplingFilter.input[namespaceIdx] as string).slice(1, -2),
    };
  }

  assert(samplingFilter.type === "namespaceSample");
  return samplingFilter;
}

getSamplingFilterAsNamespaceSample.TooManySampleFiltersError = class extends Error {
  message = "More than one sampling filter found";
};

getSamplingFilterAsNamespaceSample.NoSampleFilterError = class extends Error {
  message = "No sampling filter found";
};

getSamplingFilterAsNamespaceSample.WrongNumberOfInputsError = class extends Error {
  message = "Nonstandard filter: wrong number of inputs";
};

getSamplingFilterAsNamespaceSample.BackwardsInputsError = class extends Error {
  message = "Nonstandard filter: inputs are backwards";
};

getSamplingFilterAsNamespaceSample.BackwardsInputsError = class extends Error {
  message = "Nonstandard filter: inputs are backwards";
};

getSamplingFilterAsNamespaceSample.NotANamespaceIdError = class extends Error {
  message = "Nonstandard filter: first input is not a namespace ID";
};

getSamplingFilterAsNamespaceSample.NotAUserIdError = class extends Error {
  message = "Nonstandard filter: second input is not normandy.userId";
};

getSamplingFilterAsNamespaceSample.WrongTotalError = class extends Error {
  message = "Nonstandard filter: total is not 10,000";
};

getSamplingFilterAsNamespaceSample.NonStringInputError = class extends Error {
  message = "Nonstandard filter: non-string input";
};

export function isSamplingFilter(
  filter: FilterObject,
): filter is SampleFilterObject {
  return SAMPLING_FILTER_TYPES.includes(filter.type);
}
