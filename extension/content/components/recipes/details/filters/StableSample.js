import React from "react";
import PropTypes from "prop-types";
import { Panel, Tag } from "rsuite";

export default function BucketSample({ data }) {
  return (
    <div className="mt-4">
      <strong>Stable Sampling</strong>
      <Panel bordered className="my-2">
        <div>
          <strong>Rate</strong>
          <div className="my-1 text-subtle">
            <code>{data.rate * 100}%</code>
          </div>
        </div>
        <div className="mt-2">
          <strong>Input</strong>
          <div className="my-1">
            {data.input.map((i) => (
              <Tag key={i} className="rs-tag-rsuite">
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
