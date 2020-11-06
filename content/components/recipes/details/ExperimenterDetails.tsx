import React from "react";
import { Divider, Icon, IconButton } from "rsuite";

import CollapsibleSection, {
  HeaderButtonPopover,
} from "devtools/components/recipes/details/CollapsibleSection";
import TelemetryLink from "devtools/components/recipes/details/TelemetryLink";
import { useSelectedEnvironmentState } from "devtools/contexts/environment";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";
import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";

const ExperimenterDetails: React.FunctionComponent = () => {
  const data = useExperimenterDetailsData();
  const recipeData = useRecipeDetailsData();
  const { environment } = useSelectedEnvironmentState();

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <>
      <CollapsibleSection
        showHeaderButtonsCollapsed
        headerButtons={
          <>
            <HeaderButtonPopover message="View in Experimenter">
              <IconButton
                className="mr-1"
                componentClass="a"
                href={`${environment.experimenterUrl}experiments/${recipeData.experimenter_slug}`}
                icon={<Icon icon="external-link" />}
                target="_blank"
              />
            </HeaderButtonPopover>
            <HeaderButtonPopover message="View Telemetry">
              <TelemetryLink {...data} />
            </HeaderButtonPopover>
          </>
        }
        title={<h6>Experimenter Details</h6>}
      >
        <div className="py-1 pl-4">
          <div className="d-flex w-100">
            <div className="flex-basis-0 flex-grow-1">
              <div className="mt-4 mr-2">
                <strong>Public description</strong>
                <p className="text-subtle my-1">{data.publicDescription}</p>
              </div>
              <div className="mt-4" data-testid="details-proposed-schedule">
                <strong>Proposed schedule</strong>
                <p className="text-subtle my-1">
                  {data.proposedStartDate?.toDateString()} →{" "}
                  {data.proposedEndDate?.toDateString()} (
                  {data.proposedDuration} days)
                </p>
              </div>
              <div className="mt-4">
                <strong>Actual Schedule</strong>
                <p className="text-subtle my-1">
                  {data.startDate?.toDateString() ?? "N/A"}
                  {data.endDate ? " → " + data.endDate.toDateString() : ""}
                </p>
              </div>
            </div>
            <div className="flex-basis-0 flex-grow-1">
              {Object.keys(data.variants).length ? (
                <div className="mt-4">
                  <strong>Branches</strong>
                  <dl>
                    {Object.entries(data.variants).map(
                      ([slug, description]) => (
                        <>
                          <dt>{slug}</dt>
                          <dd>{description}</dd>
                        </>
                      ),
                    )}
                  </dl>
                </div>
              ) : null}
            </div>
          </div>
          <div className="mt-4">
            <IconButton
              className="mr-1"
              componentClass="a"
              href={`${environment.experimenterUrl}experiments/${recipeData.experimenter_slug}`}
              icon={<Icon icon="external-link" />}
              target="_blank"
            >
              View in Experimenter
            </IconButton>
            <TelemetryLink {...data}>View Telemetry</TelemetryLink>
          </div>
        </div>
      </CollapsibleSection>
      <Divider />
    </>
  );
};

export default ExperimenterDetails;
