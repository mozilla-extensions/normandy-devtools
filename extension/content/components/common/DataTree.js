import PropTypes from "prop-types";
import Tree, { TreeNode } from "rc-tree";
import React from "react";
import { Icon } from "rsuite";

import "rc-tree/assets/index.css";

export default class DataTree extends React.PureComponent {
  static propTypes = {
    data: PropTypes.object,
    onDoubleClick: PropTypes.func,
    title: PropTypes.string,
  };

  getSwitcherIcon(obj) {
    if (obj.isLeaf) {
      return null;
    }
    return (
      <Icon
        icon={obj.expanded ? "minus-square" : "plus-square"}
        style={{
          fontSize: "12px",
        }}
      />
    );
  }

  render() {
    const { data, onDoubleClick, title } = this.props;
    if (data) {
      return (
        <Tree
          defaultExpandedKeys={[title]}
          switcherIcon={this.getSwitcherIcon}
          selectable={false}
          onDoubleClick={onDoubleClick}
          showLine
        >
          {makeTreeNodes({ data, title })}
        </Tree>
      );
    }
    return null;
  }
}

function makeTreeNodes({ data, title, key = null }) {
  let fullKey = title;
  if (key) {
    if (Number.isInteger(title)) {
      fullKey = `${key}[${title}]`;
    } else if (/[^_A-Z]/i.test(title)) {
      fullKey = `${key}["${title}"]`;
    } else {
      fullKey = `${key}.${title}`;
    }
  }

  switch (typeof data) {
    case "object": {
      if (data === null) {
        return (
          <TreeNode title={`${title}: null`} key={fullKey} value={fullKey} />
        );
      }

      if (data === undefined) {
        return (
          <TreeNode
            title={`${title}: undefined`}
            key={fullKey}
            value={fullKey}
          />
        );
      }

      if (Array.isArray(data)) {
        if (data.length === 0) {
          return (
            <TreeNode title={`${title}: []`} key={fullKey} value={fullKey} />
          );
        }
        return (
          <TreeNode title={title} key={fullKey} value={fullKey}>
            {data.map((value, idx) => {
              return makeTreeNodes({
                data: value,
                title: idx,
                key: fullKey,
              });
            })}
          </TreeNode>
        );
      }

      if (data instanceof Date) {
        try {
          return (
            <TreeNode
              title={`${title}: ${data.toISOString()}`}
              key={fullKey}
              value={fullKey}
            />
          );
        } catch (e) {
          return (
            <TreeNode
              title={`${title}: Invalid date (${e})`}
              key={fullKey}
              value={fullKey}
            />
          );
        }
      }

      if (JSON.stringify(data) === "{}") {
        return (
          <TreeNode title={`${title}: {}`} key={fullKey} value={fullKey} />
        );
      }

      return (
        <TreeNode title={title} key={fullKey} value={fullKey}>
          {Object.entries(data).map(([valueKey, value], idx) =>
            makeTreeNodes({
              data: value,
              title: valueKey,
              key: fullKey,
            }),
          )}
        </TreeNode>
      );
    }
    case "string": {
      return (
        <TreeNode title={`${title}: ${data}`} key={fullKey} value={fullKey} />
      );
    }
    case "number": {
      return (
        <TreeNode title={`${title}: ${data}`} key={fullKey} value={fullKey} />
      );
    }
    case "boolean": {
      return (
        <TreeNode
          title={`${title}: ${data ? "true" : "false"}`}
          key={fullKey}
          value={fullKey}
        />
      );
    }
    case "undefined": {
      return (
        <TreeNode
          title={`${title}: <undefined>`}
          key={fullKey}
          value={fullKey}
        />
      );
    }
    default: {
      throw new Error(`Unexpected data type ${typeof data}: ${data}`);
    }
  }
}
