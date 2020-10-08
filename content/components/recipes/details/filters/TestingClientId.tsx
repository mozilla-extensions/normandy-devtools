import React, { useState, useEffect, ReactElement } from "react";

import AsyncHookView from "devtools/components/common/AsyncHookView";
import HelpIcon from "devtools/components/common/HelpIcon";
import {
  BucketSampleFilterObject,
  NamespaceSampleFilterObject,
  SampleFilterObject,
} from "devtools/types/filters";
import { AsyncHook } from "devtools/types/hooks";
import { assert } from "devtools/utils/helpers";
import { bruteForceBucketSample } from "devtools/utils/recipes";

interface TestingClientIdProps {
  className?: string;
  filter: NamespaceSampleFilterObject | BucketSampleFilterObject;
}

// default export
export const TestingClientId: React.FC<TestingClientIdProps> = ({
  className,
  filter,
}) => {
  const testingClientId = useTestingId(filter);

  return (
    <div className={`testing-client-id ${className}`}>
      <label className="font-weight-bold" id="testing-clientid">
        Testing clientId
      </label>
      <HelpIcon>
        Setting the preference <code>app.normandy.clientId</code> to this value
        will satisfy this bucket sample filter. It will not automatically
        satisfy other filters.
      </HelpIcon>
      <div aria-labelledby="testing-clientid">
        <AsyncHookView hook={testingClientId}>
          {(value): ReactElement => (
            <code>app.normandy.clientId = {value}</code>
          )}
        </AsyncHookView>
      </div>
    </div>
  );
};

export default TestingClientId;

function useTestingId(filter: SampleFilterObject): AsyncHook<string> {
  const [testingClientId, setTestingClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ toString: () => string }>(null);

  useEffect(() => {
    bruteForceBucketSample(filter)
      .then((clientId) => {
        setTestingClientId(clientId);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (error) {
    return { value: null, loading: false, error };
  } else if (loading) {
    return { value: null, loading: true, error: null };
  }

  assert(
    !!testingClientId,
    "Hook should have a value if it isn't loading or an error",
  );

  return { value: testingClientId, loading: false, error: null };
}
