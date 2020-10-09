import React from "react";

import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";

const ExperimenterDetails: React.FunctionComponent = () => {
  const data = useExperimenterDetailsData();
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
        {data && Object.keys(data).length ? (
          <>
            <div className="mt-4">
              <strong>Public description</strong>
              <p>{data.publicDescription}</p>
            </div>
            <div className="mt-4" data-testid="details-proposed-schedule">
              <strong>Proposed schedule</strong>
              <p>
                {data.proposedStartDate?.toDateString()} →{" "}
                {data.proposedEndDate?.toDateString()} ({data.proposedDuration}{" "}
                days)
              </p>
            </div>
            <div className="mt-4">
              <strong>Actual Schedule</strong>
              <p>
                {data.startDate ? data.startDate.toDateString() : "N/A"}
                {data.endDate ? " → " + data.endDate.toDateString() : ""}
              </p>
            </div>
            {Object.keys(data.variants).length ? (
              <div className="mt-4">
                <strong>Branches</strong>
                <dl>
                  {Object.entries(data.variants).map(([slug, description]) => (
                    <>
                      <dt>{slug}</dt>
                      <dd>{description}</dd>
                    </>
                  ))}
                </dl>
              </div>
            ) : null}
          </>
        ) : (
          <p>N/A</p>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default ExperimenterDetails;
