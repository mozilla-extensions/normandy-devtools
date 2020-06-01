import PropTypes from "prop-types";
import React from "react";
import { Panel, Tag } from "rsuite";

export default function BucketSample({ data }) {
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
        <div className="mt-2">
          <strong>Input</strong>
          <div className="my-1">
            {data.input.map((i) => (
              <Tag key={i} className="rs-tag-rsuite font-family-monospace">
                {i}
              </Tag>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

BucketSample.propTypes = {
  data: PropTypes.object,
};
