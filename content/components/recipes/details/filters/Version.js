import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

export default function Version({ data }) {
  return (
    <div className="mt-4">
      <strong>Versions</strong>
      <div className="my-1">
        {data.versions.map((v) => (
          <Tag key={v}>{v}</Tag>
        ))}
      </div>
    </div>
  );
}

Version.propTypes = {
  data: PropTypes.object,
};
