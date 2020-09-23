import React from "react";

import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";

export default function ExperimenterDetails() {
  const data = useExperimenterDetailsData();
  const proposed_start = new Date(data.proposed_start_date).toUTCString();
  return (
    <div>
      <p>{data.public_description}</p>
      <p>{proposed_start}</p>
      <p>{data.proposed_duration} days</p>
    </div>
  );
}
