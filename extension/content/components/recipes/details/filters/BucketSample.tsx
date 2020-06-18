/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { Panel, Tag, Whisper, Icon, Tooltip } from "rsuite";
import { BucketSampleFilterObject } from "types/filters";

import { bruteForceBucketSample } from "devtools/utils/recipes";

const BucketSample: React.FunctionComponent<{
  data: BucketSampleFilterObject;
}> = ({ data }) => {
  return (
    <div className="mt-4">
      <strong>Bucket Sampling</strong>
      <Panel bordered className="my-2">
        <div className="d-flex">
          <div className="flex-grow-1 flex-basis-0 pr-2">
            <strong>Percentage</strong>
            <div className="my-1 text-subtle">
              <code>{(data.count * 100) / data.total}%</code>
            </div>
          </div>
          <div className="flex-grow-1 flex-basis-0 pr-2">
            <strong>Start</strong>
            <div className="my-1 text-subtle">
              <code>{data.start}</code>
            </div>
          </div>
          <div className="flex-grow-1 flex-basis-0 pr-2">
            <strong>Count</strong>
            <div className="my-1 text-subtle">
              <code>{data.count}</code>
            </div>
          </div>
          <div className="flex-grow-1 flex-basis-0">
            <strong>Total</strong>
            <div className="my-1 text-subtle">
              <code>{data.total}</code>
            </div>
          </div>
        </div>
        <div className="d-flex mt-2">
          <div className="flex-grow-1 flex-basis-0">
            <strong>Input</strong>
            <div className="my-1">
              {data.input.map((i) => (
                <Tag key={i} className="rs-tag-rsuite font-family-monospace">
                  {i}
                </Tag>
              ))}
            </div>
          </div>
          <TestingClientId className="flex-grow-1 flex-basis-0" filter={data} />
        </div>
      </Panel>
    </div>
  );
};

interface TestingClientIdProps {
  className: string;
  filter: BucketSampleFilterObject;
}

export const TestingClientId: React.FunctionComponent<TestingClientIdProps> = ({
  className,
  filter,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
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

function useTestingId(
  filter: BucketSampleFilterObject,
): { loading: boolean; value: string | null; error: Error | null } {
  const [testingClientId, setTestingClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return { value: testingClientId, loading, error };
}

export default BucketSample;
