import React from "react";
import { NavLink } from "react-router-dom";
import { Icon, Nav, Sidenav, Popover, Whisper } from "rsuite";

import { useEnvironmentState } from "devtools/contexts/environment";
import { splitCamelCase } from "devtools/utils/helpers";

export const AppSidebar: React.FC = () => {
  const { selectedKey } = useEnvironmentState();

  const versionPopover = (
    <Popover>
      <dl>
        {Object.entries(__BUILD__).map(([key, value]) => {
          return (
            <>
              <dt>{splitCamelCase(key, { case: "title-case" })}</dt>
              <dd>
                {typeof value === "string" ? value : JSON.stringify(value)}
              </dd>
            </>
          );
        })}
      </dl>
    </Popover>
  );

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
          </Nav>

          <div className="text-subtle cursor-pointer p-2 flex-grow-0">
            <Whisper placement="topStart" speaker={versionPopover}>
              <span>{__BUILD__.version}</span>
            </Whisper>
          </div>
        </Sidenav.Body>
      </Sidenav>
    </div>
  );
};
