import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

export default function Country({ data }) {
  return (
    <div className="mt-4">
      <strong>Countries</strong>
      <div className="my-1">
        {data.countries.map((c) => (
          <Tag key={c}>{c}</Tag>
        ))}
      </div>
    </div>
  );
}

Country.propTypes = {
  data: PropTypes.object,
};
