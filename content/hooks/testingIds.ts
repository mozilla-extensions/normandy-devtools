import { useState, useMemo, useEffect } from "react";

import { MultiPreferenceExperimentArguments } from "devtools/types/arguments";
import { SampleFilterObject } from "devtools/types/filters";
import { AsyncHook } from "devtools/types/hooks";
import { Revision } from "devtools/types/recipes";
import {
  bruteForceSampleAndBranches,
  isSamplingFilter,
} from "devtools/utils/recipes";

type TestingIdsValue = { [key: string]: null | string };

export function useBranchTestingIds(
  revision: Revision<MultiPreferenceExperimentArguments>,
): AsyncHook<TestingIdsValue> {
  const [branchIds, setBranchIds] = useState<TestingIdsValue>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sampleFilters: Array<SampleFilterObject> = revision.filter_object.filter(
    isSamplingFilter,
  );
  if (sampleFilters.length > 1) {
    return {
      loading: false,
      value: null,
      error: new Error("Found too many sample filters"),
    };
  }

  let filter = null;
  if (sampleFilters.length) {
    filter = sampleFilters[0];
  }

  const testingIdGenerator = useMemo(() => {
    return bruteForceSampleAndBranches(
      filter,
      revision.arguments.branches,
      (clientId) => `${clientId}-${revision.arguments.slug}-branch`,
    );
  }, [filter, revision.arguments.branches, revision.arguments.slug]);

  useEffect(() => {
    (async (): Promise<void> => {
      if (
        !revision.filter_object.length ||
        !revision.arguments.branches?.length
      ) {
        setLoading(true);
        setError(null);
        setBranchIds(null);
        return;
      }

      if (!filter) {
        setError(new Error("No sampling filter found"));
        setLoading(false);
        setBranchIds(null);
        return;
      }

      try {
        setBranchIds({});
        setError(null);
        setLoading(false);

        if (testingIdGenerator) {
          for await (const nextTestingIds of testingIdGenerator) {
            setBranchIds(nextTestingIds);
          }
        }
      } catch (err) {
        setError(err);
        setLoading(false);
        setBranchIds(null);
      }
    })();
  }, [revision.arguments?.branches, revision.filter_object]);

  if (error) {
    return { error, loading: false, value: null };
  } else if (loading) {
    return { error: null, loading: true, value: null };
  }

  return { value: branchIds, loading: false, error: null };
}
