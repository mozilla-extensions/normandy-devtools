import PropTypes from "prop-types";
import React from "react";
import { Tag } from "rsuite";

export default function Locale({ data }) {
  return (
    <div className="mt-4">
      <strong>Locales</strong>
      <div className="my-1">
        {data.locales.map((l) => (
          <Tag key={l}>{l}</Tag>
        ))}
      </div>
    </div>
  );
}

Locale.propTypes = {
  data: PropTypes.object,
};
