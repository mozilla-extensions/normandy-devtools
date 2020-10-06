import React, { ReactElement } from "react";
import { Icon, IconButton } from "rsuite";

interface CollapsibleSectionProps {
  headerButtons?: ReactElement;
  collapsed?: boolean;
  title: ReactElement;
  testId?: string;
}

// default export
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  children,
  headerButtons,
  title,
  collapsed: defaultCollapsed = false,
  testId = null,
}) => {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  const handleCollapseToggleClick = (): void => {
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
        {headerButtons && !collapsed && (
          <div style={{ visibility: collapsed ? "hidden" : "visible" }}>
            {headerButtons}
          </div>
        )}
      </div>
      {collapsed ? null : children}
    </>
  );
};

export default CollapsibleSection;
