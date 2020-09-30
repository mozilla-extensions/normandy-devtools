import React, { useState, useEffect } from "react";
import { Whisper, Tooltip, Icon } from "rsuite";

import { bruteForceBucketSample } from "devtools/utils/recipes";
import {
  BucketSampleFilterObject,
  NamespaceSampleFilterObject,
} from "types/filters";

interface TestingClientIdProps {
  className?: string;
  filter: NamespaceSampleFilterObject | BucketSampleFilterObject;
}

// default export
export const TestingClientId: React.FunctionComponent<TestingClientIdProps> = ({
  className,
  filter,
}) => {
  const testingClientId = useTestingId(filter);

  return (
    <div className={`testing-client-id ${className}`}>
      <label className="mr-half" id="testing-clientid">
        Testing clientId
      </label>
      <Whisper
        enterable={true}
        placement="top"
        speaker={
          <Tooltip>
            Setting the preference <code>app.normandy.clientId</code> to this
            value will make this bucket sample always match.
          </Tooltip>
        }
        trigger="click"
      >
        <Icon icon="question-circle" role="button" />
      </Whisper>
      <div aria-labelledby="testing-clientid">
        {testingClientId.loading && "Loading..."}
        {testingClientId.error && (
          <div className="error">{testingClientId.error.toString()}</div>
        )}
        {testingClientId.value && (
          <code>app.normandy.clientId = {testingClientId.value}</code>
        )}
      </div>
    </div>
  );
};

export default TestingClientId;

function useTestingId(
  filter: NamespaceSampleFilterObject | BucketSampleFilterObject,
): { loading: boolean; value: string | null; error: Error | null } {
  const [testingClientId, setTestingClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let bucketSampleEquivalent: BucketSampleFilterObject;
  if (filter.type === "namespaceSample") {
    bucketSampleEquivalent = {
      type: "bucketSample",
      start: filter.start,
      count: filter.count,
      total: filter.total,
      input: [`"${filter.namespace}"`, "normandy.userId"],
    };
  } else {
    bucketSampleEquivalent = filter;
  }

  useEffect(() => {
    bruteForceBucketSample(bucketSampleEquivalent)
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

  return { value: testingClientId, loading, error };
}
