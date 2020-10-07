import React from "react";
import { Panel, Tag } from "rsuite";

import TestingClientId from "devtools/components/recipes/details/filters/TestingClientId";
import { NamespaceSampleFilterObject } from "devtools/types/filters";

// default export
const NamespaceSample: React.FunctionComponent<{
  data: NamespaceSampleFilterObject;
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
            <strong>Namespace</strong>
            <div className="my-1">
              <Tag className="rs-tag-rsuite font-family-monospace">
                {data.namespace}
              </Tag>
            </div>
          </div>
          <TestingClientId className="flex-grow-1 flex-basis-0" filter={data} />
        </div>
      </Panel>
    </div>
  );
};

export default NamespaceSample;
