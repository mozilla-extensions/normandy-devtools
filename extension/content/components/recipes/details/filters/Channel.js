import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

export default function Channel({ data }) {
  return (
    <div className="mt-4">
      <strong>Channels</strong>
      <div className="my-1">
        {data.channels.map((c) => (
          <Tag key={c}>{c}</Tag>
        ))}
      </div>
    </div>
  );
}

Channel.propTypes = {
  data: PropTypes.object,
};
