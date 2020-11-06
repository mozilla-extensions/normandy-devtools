import React, { ReactElement } from "react";
import { Icon, IconButton, Popover, Whisper } from "rsuite";

interface CollapsibleSectionProps {
  headerButtons?: ReactElement;
  showHeaderButtonsCollapsed?: boolean;
  collapsed?: boolean;
  title: ReactElement;
  testId?: string;
}

interface HeaderButtonPopoverProps {
  message: string;
}

// default export
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  children,
  headerButtons,
  showHeaderButtonsCollapsed = false,
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
        {headerButtons && (!collapsed || showHeaderButtonsCollapsed) && (
          <div>{headerButtons}</div>
        )}
      </div>
      {collapsed ? null : children}
    </>
  );
};

export const HeaderButtonPopover: React.FC<HeaderButtonPopoverProps> = ({
  children,
  message,
}) => {
  const popover = <Popover>{message}</Popover>;

  return (
    <Whisper placement="autoVerticalEnd" speaker={popover} trigger="hover">
      {children}
    </Whisper>
  );
};

export default CollapsibleSection;
