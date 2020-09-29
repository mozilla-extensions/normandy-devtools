import React from "react";

import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";

const ExperimenterDetails: React.FunctionComponent<{}> = () => {
  const data = useExperimenterDetailsData();
  const {
    publicDescription,
    proposedStartDate,
    proposedDuration,
    variants,
  } = data;

  let endDate;
  if (proposedStartDate) {
    endDate = new Date();
    endDate.setDate(proposedStartDate.getDate() + proposedDuration);
  }

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
        <div className="mt-4">
          <strong>Proposed schedule</strong>
          <p>
            {proposedStartDate?.toUTCString()} → {endDate?.toUTCString()} (
            {proposedDuration} days)
          </p>
        </div>
        <div className="mt-4">
          <strong>Variants</strong>
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
