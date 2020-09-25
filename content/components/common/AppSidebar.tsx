import React from "react";
import { NavLink } from "react-router-dom";
import { Icon, Nav, Sidenav, Popover, Whisper, TagGroup, Tag } from "rsuite";

import { useEnvironmentState } from "devtools/contexts/environment";
import { splitCamelCase } from "devtools/utils/helpers";

export const AppSidebar: React.FC = () => {
  const { selectedKey } = useEnvironmentState();

  return (
    <div className="app-sidebar">
      <Sidenav className="h-100">
        <Sidenav.Body className="d-flex flex-column h-100">
          <Nav vertical className="flex-grow-1">
            <Nav.Item
              componentClass={NavLink}
              icon={<Icon icon="book" />}
              to={`/${selectedKey}/recipes`}
            >
              Recipes
            </Nav.Item>
            {__ENV__ === "web" ? null : (
              <>
                <Nav.Item
                  componentClass={NavLink}
                  icon={<Icon icon="filter" />}
                  to={`/${selectedKey}/filters`}
                >
                  Filters
                </Nav.Item>
                <Nav.Item
                  componentClass={NavLink}
                  icon={<Icon icon="table" />}
                  to={`/${selectedKey}/pref-studies`}
                >
                  Pref Studies
                </Nav.Item>
                <Nav.Item
                  componentClass={NavLink}
                  icon={<Icon icon="puzzle-piece" />}
                  to={`/${selectedKey}/addon-studies`}
                >
                  Add-on Studies
                </Nav.Item>
              </>
            )}
          </Nav>

          <div className="p-2 flex-grow-0">
            <Whisper placement="topStart" speaker={<VersionPopover />}>
              <span className="text-subtle cursor-default">
                v{__BUILD__.version}
              </span>
            </Whisper>
          </div>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
};

const VersionPopover: React.FC = (props) => {
  const buildKeys = ["commitHash", "version"];

  let tagGroup = null;
  if (DEVELOPMENT) {
    tagGroup = (
      <TagGroup className="mt-2 mb-1">
        <Tag color="blue">Development</Tag>
        {__BUILD__.hasUncommittedChanges ? (
          <Tag color="orange">Uncommitted Changes</Tag>
        ) : null}
      </TagGroup>
    );
  }

  return (
    <Popover {...props}>
      <dl>
        {buildKeys.map((key) => {
          const value = __BUILD__[key];
          return (
            <React.Fragment key={key}>
              <dt>{splitCamelCase(key, { case: "title-case" })}</dt>
              <dd>
                <code className="text-subtle">
                  {typeof value === "string" ? value : JSON.stringify(value)}
                </code>
              </dd>
            </React.Fragment>
          );
        })}
      </dl>
      {tagGroup}
    </Popover>
  );
};
