import React from "react";
import { Icon, IconButton, Nav } from "rsuite";
import { TypeAttributes as RSTypeAttributes } from "rsuite/lib/@types/common";

const MONITORING_URL = "https://grafana.telemetry.mozilla.org";
const DASHBOARD_ID = "XspgvdxZz";

export enum TelemetryLinkTypes {
  iconButton,
  navItem,
}

interface TelemetryLinkProps {
  type?: TelemetryLinkTypes;
  endDate?: Date;
  normandySlug: string;
  startDate?: Date;
  status: string;
  appearance?: RSTypeAttributes.Appearance;
}

interface TelemetryLinkExtraProps {
  icon?: React.ReactElement;
}

const TelemetryLink: React.FC<TelemetryLinkProps> = ({
  appearance = "default",
  children,
  type = TelemetryLinkTypes.iconButton,
  startDate,
  endDate,
  normandySlug,
  status,
}) => {
  let from = "";
  let to = "";

  if (startDate && ["live", "complete"].includes(status)) {
    from = `${startDate.getTime() - 24 * 3600 * 1000}`;
  }

  if (endDate && status === "complete") {
    to = `${endDate.getTime() + 2 * 24 * 3600 * 1000}`;
  }

  let Component = IconButton;
  let extraProps: TelemetryLinkExtraProps = {
    icon: <Icon icon="bar-chart" />,
  };
  if (type === TelemetryLinkTypes.navItem) {
    Component = Nav.Item;
    extraProps = {};
  }

  const url = `${MONITORING_URL}/d/${DASHBOARD_ID}/experiment-enrollment?orgId=1&var-experiment_id=${normandySlug}&from=${from}&to=${to}`;
  return (
    <Component
      appearance={appearance}
      componentClass="a"
      href={url}
      target="_blank"
      {...extraProps}
    >
      {children}
    </Component>
  );
};

export default TelemetryLink;
