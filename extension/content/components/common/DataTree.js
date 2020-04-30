// @ts-nocheck
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
    defaultExpanded: PropTypes.bool,
  };

  static defaultProps = {
    defaultExpanded: true,
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
    const { data, onDoubleClick, title, defaultExpanded } = this.props;
    if (data) {
      return (
        <Tree
          showLine
          defaultExpandedKeys={defaultExpanded ? [title] : []}
          selectable={false}
          switcherIcon={this.getSwitcherIcon}
          onDoubleClick={onDoubleClick}
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
          <TreeNode key={fullKey} title={`${title}: null`} value={fullKey} />
        );
      }

      if (data === undefined) {
        return (
          <TreeNode
            key={fullKey}
            title={`${title}: undefined`}
            value={fullKey}
          />
        );
      }

      if (Array.isArray(data)) {
        if (data.length === 0) {
          return (
            <TreeNode key={fullKey} title={`${title}: []`} value={fullKey} />
          );
        }

        return (
          <TreeNode key={fullKey} title={title} value={fullKey}>
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
              key={fullKey}
              title={`${title}: ${data.toISOString()}`}
              value={fullKey}
            />
          );
        } catch (e) {
          return (
            <TreeNode
              key={fullKey}
              title={`${title}: Invalid date (${e})`}
              value={fullKey}
            />
          );
        }
      }

      if (JSON.stringify(data) === "{}") {
        return (
          <TreeNode key={fullKey} title={`${title}: {}`} value={fullKey} />
        );
      }

      return (
        <TreeNode key={fullKey} title={title} value={fullKey}>
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
        <TreeNode key={fullKey} title={`${title}: ${data}`} value={fullKey} />
      );
    }

    case "number": {
      return (
        <TreeNode key={fullKey} title={`${title}: ${data}`} value={fullKey} />
      );
    }

    case "boolean": {
      return (
        <TreeNode
          key={fullKey}
          title={`${title}: ${data ? "true" : "false"}`}
          value={fullKey}
        />
      );
    }

    case "undefined": {
      return (
        <TreeNode
          key={fullKey}
          title={`${title}: <undefined>`}
          value={fullKey}
        />
      );
    }

    default: {
      throw new Error(`Unexpected data type ${typeof data}: ${data}`);
    }
  }
}
