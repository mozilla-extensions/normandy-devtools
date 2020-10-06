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
          <TreeNode
            key={fullKey}
            data-jexlExpression={fullKey}
            title={`${title}: null`}
          />
        );
      }

      if (data === undefined) {
        return (
          <TreeNode
            key={fullKey}
            data-jexlExpression={fullKey}
            title={`${title}: undefined`}
          />
        );
      }

      if (Array.isArray(data)) {
        if (data.length === 0) {
          return (
            <TreeNode
              key={fullKey}
              data-jexlExpression={fullKey}
              title={`${title}: []`}
            />
          );
        }

        return (
          <TreeNode key={fullKey} data-jexlExpression={fullKey} title={title}>
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
              data-jexlExpression={fullKey}
              title={`${title}: ${data.toISOString()}`}
            />
          );
        } catch (e) {
          return (
            <TreeNode
              key={fullKey}
              data-jexlExpression={fullKey}
              title={`${title}: Invalid date (${e})`}
            />
          );
        }
      }

      if (JSON.stringify(data) === "{}") {
        return (
          <TreeNode
            key={fullKey}
            data-jexlExpression={fullKey}
            title={`${title}: {}`}
          />
        );
      }

      return (
        <TreeNode key={fullKey} data-jexlExpression={fullKey} title={title}>
          {Object.entries(data).map(([valueKey, value]) =>
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
        <TreeNode
          key={fullKey}
          data-jexlExpression={fullKey}
          title={`${title}: ${data}`}
        />
      );
    }

    case "number": {
      return (
        <TreeNode
          key={fullKey}
          data-jexlExpression={fullKey}
          title={`${title}: ${data}`}
        />
      );
    }

    case "boolean": {
      return (
        <TreeNode
          key={fullKey}
          data-jexlExpression={fullKey}
          title={`${title}: ${data ? "true" : "false"}`}
        />
      );
    }

    case "undefined": {
      return (
        <TreeNode
          key={fullKey}
          data-jexlExpression={fullKey}
          title={`${title}: <undefined>`}
        />
      );
    }

    default: {
      throw new Error(`Unexpected data type ${typeof data}: ${data}`);
    }
  }
}
