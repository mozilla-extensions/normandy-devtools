import React from "react";
import { Icon, IconButton } from "rsuite";

const MONITORING_URL = "https://grafana.telemetry.mozilla.org";
const DASHBOARD_ID = "XspgvdxZz";

interface TelemetryLinkProps {
  endDate: Date;
  normandySlug: string;
  startDate: Date;
  status: string;
}

const TelemetryLink: React.FC<TelemetryLinkProps> = ({
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

  const url = `${MONITORING_URL}/d/${DASHBOARD_ID}/experiment-enrollment?orgId=1&var-experiment_id=${normandySlug}&from=${from}&to=${to}`;
  return (
    <IconButton
      appearance="subtle"
      componentClass="a"
      href={url}
      icon={<Icon icon="external-link" />}
      target="_blank"
    >
      View Telemetry
    </IconButton>
  );
};

export default TelemetryLink;
