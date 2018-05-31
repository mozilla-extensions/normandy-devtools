import React from "react";
import Tree, { TreeNode } from "rc-tree";
import "rc-tree/assets/index.css";

export default class DataTree extends React.PureComponent {
  render() {
    const { data, title, key = "0" } = this.props;
    return (
      <Tree defaultExpandedKeys={["0", "0-0", "0-0-0"]}>
        {makeTreeNodes({ data, title, key })}
      </Tree>
    );
  }
}

function makeTreeNodes({ data, title, key }) {
  switch (typeof data) {
    case "object": {
      if (data === null) {
        return <TreeNode title={`${title}: null`} key={key} />;
      }

      if (data === undefined) {
        return <TreeNode title={`${title}: undefined`} key={key} />;
      }

      if (Array.isArray(data)) {
        if (data.length === 0) {
          return <TreeNode title={`${title}: []`} key={key} />;
        }
        return (
          <TreeNode title={title} key={key}>
            {data.map((value, idx) => {
              return makeTreeNodes({
                data: value,
                title: `${idx}`,
                key: `${key}-${idx}`,
              });
            })}
          </TreeNode>
        );
      }

      if (data instanceof Date) {
        try {
          return (
            <TreeNode title={`${title}: ${data.toISOString()}`} key={key} />
          );
        } catch (e) {
          return <TreeNode title={`${title}: Invalid date (${e})`} key={key} />;
        }
      }

      if (JSON.stringify(data) === "{}") {
        return <TreeNode title={`${title}: {}`} key={key} />;
      }

      return (
        <TreeNode title={title} key={key}>
          {Object.entries(data).map(([valueKey, value], idx) =>
            makeTreeNodes({
              data: value,
              title: valueKey,
              key: `${key}-${idx}`,
            }),
          )}
        </TreeNode>
      );
    }
    case "string": {
      return <TreeNode title={`${title}: ${data}`} key={key} />;
    }
    case "number": {
      return <TreeNode title={`${title}: ${data}`} key={key} />;
    }
    case "boolean": {
      return (
        <TreeNode title={`${title}: ${data ? "true" : "false"}`} key={key} />
      );
    }
    default: {
      throw new Error(`Unexpected data type ${typeof data}: ${data}`);
    }
  }
}
