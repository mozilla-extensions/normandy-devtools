import PropTypes from "prop-types";
import React from "react";
import { Icon, IconButton } from "rsuite";

export default function CollapsibleSection({
  children,
  headerButtons,
  title,
  testId = null,
  ...props
}) {
  const [collapsed, setCollapsed] = React.useState(props.collapsed);

  const handleCollapseToggleClick = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <div className="d-flex">
        <div className="d-flex align-items-center flex-grow-1">
          <div className="flex-grow-0 w-40px">
            <IconButton
              appearance="subtle"
              data-testid={testId}
              icon={
                <Icon icon={collapsed ? "chevron-right" : "chevron-down"} />
              }
              size="xs"
              onClick={handleCollapseToggleClick}
            />
          </div>
          {title}
        </div>
        <div style={{ visibility: collapsed ? "hidden" : "visible" }}>
          {headerButtons}
        </div>
      </div>
      {collapsed ? null : children}
    </>
  );
}

CollapsibleSection.propTypes = {
  children: PropTypes.any,
  collapsed: PropTypes.bool,
  headerButtons: PropTypes.any,
  title: PropTypes.any,
  testId: PropTypes.string,
};
