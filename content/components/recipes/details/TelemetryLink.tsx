import React from "react";
import { Icon, IconButton } from "rsuite";

import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";

const MONITORING_URL = "https://grafana.telemetry.mozilla.org";
const DASHBOARD_ID = "XspgvdxZz";

interface TelemetryLinkProps {
  slug: string;
}

const TelemetryLink: React.FC<TelemetryLinkProps> = ({ slug }) => {
  const { startDate, endDate } = useExperimenterDetailsData();

  let from = "";
  let to = "";

  if (startDate) {
    // todo: if status in live, complete
    from = `${startDate.getTime() - 24 * 3600 * 1000}`;
  }

  if (endDate) {
    // todo: if status is complete
    to = `${startDate.getTime() + 2 * 24 * 3600 * 1000}`;
  }

  const url = `${MONITORING_URL}/d/${DASHBOARD_ID}/experiment-enrollment?orgId=1&var-experiment_id=${slug}&from=${from}&to=${to}`;
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
