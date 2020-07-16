/* eslint-disable react/prop-types */
import React from "react";
import { Panel, Tag } from "rsuite";

import TestingClientId from "devtools/components/recipes/details/filters/TestingClientId";
import { BucketSampleFilterObject } from "devtools/types/filters";

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

export default BucketSample;
