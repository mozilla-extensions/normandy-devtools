// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import { Icon, Tag } from "rsuite";
import validator from "validator";

import Highlight from "devtools/components/common/Highlight";
import { splitCamelCase } from "devtools/utils/helpers";

export default function Generic({
  data,
  ordering = [],
  omit = [],
  formatters = {},
}) {
  Object.keys(data)
    .filter((k) => !ordering.includes(k) && !omit.includes(k))
    .sort((a, b) => {
      // Pin branches to the bottom
      if (a === "branches") {
        return 1;
      } else if (b === "branches") {
        return -1;
      }

      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }

      return 0;
    })
    .forEach((k) => {
      ordering.push(k);
    });

  const details = ordering.map((key) => {
    const value = data[key];
    let label = key;

    if (key in formatters) {
      return formatters[key](key, value, data);
    }

    const isURL =
      typeof value === "string" &&
      validator.isURL(value, { require_protocol: true });

    let labelExtra = null;
    if (isURL) {
      labelExtra = (
        <div>
          <a href={value} rel="noopener noreferrer" target="_blank">
            <Icon icon="external-link" />
          </a>
        </div>
      );
    }

    let displayValue = null;
    if (isURL) {
      displayValue = (
        <div className="my-1">
          <a
            className="text-subtle"
            href={value}
            rel="noopener noreferrer"
            target="_blank"
          >
            {value}
          </a>
        </div>
      );
    } else if (value === "") {
      displayValue = (
        <div className="my-1 text-subtle">
          <em>
            <code>(no value set)</code>
          </em>
        </div>
      );
    } else if (["string", "number"].includes(typeof value)) {
      displayValue = (
        <div className="my-1 text-subtle">
          {key === "slug" ? <code>{value}</code> : value}
        </div>
      );
    } else if (typeof value === "boolean") {
      if (key.startsWith("is")) {
        label += "?";
      }

      displayValue = (
        <div className="my-1">
          <Tag color={value ? "green" : "red"}>{value ? "Yes" : "No"}</Tag>
        </div>
      );
    } else if (Array.isArray(value)) {
      displayValue = (
        <ul>
          {value.map((item, index) => {
            let displayItem = null;
            if (typeof item === "object") {
              displayItem = <Generic data={item} />;
            } else {
              displayItem =
                typeof item === "string" ? item : JSON.stringify(item);
            }

            return <li key={index}>{displayItem}</li>;
          })}
        </ul>
      );
    } else {
      displayValue = (
        <div className="my-1 text-subtle">
          <Highlight className="javascript">
            {JSON.stringify(value, null, 2)}
          </Highlight>
        </div>
      );
    }

    return (
      <div key={key} className="mt-4">
        <div className="d-flex align-items-center">
          <div className="pr-2 font-weight-bold">
            {splitCamelCase(label, { case: "title-case" })}
          </div>
          {labelExtra}
        </div>
        <div>{displayValue}</div>
      </div>
    );
  });

  return <>{details}</>;
}

Generic.propTypes = {
  data: PropTypes.object.isRequired,
  ordering: PropTypes.array,
  omit: PropTypes.array,
  formatters: PropTypes.object,
};
