import React from "react";

import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";

const ExperimenterDetails: React.FunctionComponent<{}> = () => {
  const data = useExperimenterDetailsData();
  const {
    publicDescription,
    proposedStartDate,
    proposedEndDate,
    proposedDuration,
    startDate,
    endDate,
    variants,
  } = data;

  return (
    <CollapsibleSection
      headerButtons={<></>}
      title={
        <>
          <h6>Experimenter Details</h6>
        </>
      }
    >
      <div className="py-1 pl-4">
        <div className="mt-4">
          <strong>Public description</strong>
          <p>{publicDescription}</p>
        </div>
        <div className="mt-4" data-testid="details-proposed-schedule">
          <strong>Proposed schedule</strong>
          <p>
            {proposedStartDate?.toDateString()} →{" "}
            {proposedEndDate?.toDateString()} ({proposedDuration} days)
          </p>
        </div>
        <div className="mt-4">
          <strong>Actual Schedule</strong>
          <p>
            {startDate ? startDate.toDateString() : "N/A"}
            {endDate ? " → " + endDate.toDateString() : ""}
          </p>
        </div>
        <div className="mt-4">
          <strong>Branches</strong>
          {variants.length ? (
            <ul>
              {variants.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default ExperimenterDetails;
