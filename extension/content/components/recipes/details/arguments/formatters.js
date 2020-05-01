import React from "react";
import { Tag } from "rsuite";
import { splitCamelCase } from "devtools/utils/helpers";

export function multiColumnFormatter(fields = [], formatters = {}) {
  const columns = (key, value, data) => (
    <div className="d-flex w-100">
      {fields.map((field) => (
        <div key={field} className="flex-basis-0 flex-grow-1">
          {formatters[field](field, data[field], data)}
        </div>
      ))}
    </div>
  );
  return columns;
}

export function stringFormatter(key, value) {
  return (
    <div className="mt-4">
      <div className="d-flex align-items-center">
        <div className="pr-2 font-weight-bold">
          {splitCamelCase(key, { case: "title-case" })}
        </div>
      </div>
      <div className="my-1 text-subtle">{value}</div>
    </div>
  );
}

export function codeFormatter(key, value) {
  return stringFormatter(key, <code>{value}</code>);
}

export function tagFormatter(options = {}) {
  const { className, color } = options;
  return (key, value) => {
    return stringFormatter(
      key,
      <Tag className={className} color={color}>
        {value}
      </Tag>,
    );
  };
}

export function booleanFormatter(key, value) {
  const label = key.startsWith("is") ? `${key}?` : key;

  let text = value ? "True" : "False";
  if (key.startsWith("is")) {
    text = value ? "Yes" : "No";
  }

  return (
    <div className="mt-4">
      <div className="d-flex align-items-center">
        <div className="pr-2 font-weight-bold">
          {splitCamelCase(label, { case: "title-case" })}
        </div>
      </div>
      <div className="my-1 text-subtle">
        <Tag color={value ? "green" : "red"}>{text}</Tag>
      </div>
    </div>
  );
}

export function tableFormatter(fields = [], formatters = {}) {
  const table = (key, values, data) => {
    return (
      <div className="mt-4">
        <div className="d-flex align-items-center">
          <div className="pr-2 font-weight-bold">
            {splitCamelCase(key, { case: "title-case" })}
          </div>
        </div>
        <div className="mt-3 mb-1 text-subtle">
          <table className="data-table w-100">
            <thead>
              <tr>
                {fields.map((field) => (
                  <th key={field}>
                    {splitCamelCase(field, { case: "title-case" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {values.map((value, index) => (
                <tr key={index}>
                  {fields.map((field) => (
                    <td key={field}>
                      {formatters[field]
                        ? formatters[field](index, value[field])
                        : value[field]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return table;
}

export function nl2pbrFormatter(key, value) {
  return stringFormatter(
    key,
    <>
      {value.split("\n\n").map((p, i) => {
        const nl = p.split("\n");
        return (
          <p key={i}>
            {nl.map((l, k) => (
              <>
                {l}
                {k < nl.length - 1 ? <br /> : null}
              </>
            ))}
          </p>
        );
      })}
    </>,
  );
}
