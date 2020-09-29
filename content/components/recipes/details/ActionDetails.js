import PropTypes from "prop-types";
import React from "react";
import { ButtonGroup, Icon, IconButton, Popover, Tag, Whisper } from "rsuite";

import Highlight from "devtools/components/common/Highlight";
import AddonStudy from "devtools/components/recipes/details/arguments/AddonStudy";
import BranchedAddonStudy from "devtools/components/recipes/details/arguments/BranchedAddonStudy";
import Generic from "devtools/components/recipes/details/arguments/GenericArguments";
import MessagingExperiment from "devtools/components/recipes/details/arguments/MessagingExperiment";
import MultiPreferenceExperiment from "devtools/components/recipes/details/arguments/MultiPreferenceExperiment";
import PreferenceExperiment from "devtools/components/recipes/details/arguments/PreferenceExperiment";
import PreferenceRollout from "devtools/components/recipes/details/arguments/PreferenceRollout";
import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";

const MODE_RICH = "RICH";
const MODE_RAW = "RAW";

const ACTION_DETAILS_MAPPING = {
  "addon-study": AddonStudy,
  "branched-addon-study": BranchedAddonStudy,
  "messaging-experiment": MessagingExperiment,
  "multi-preference-experiment": MultiPreferenceExperiment,
  "opt-out-study": AddonStudy,
  "preference-experiment": PreferenceExperiment,
  "preference-rollout": PreferenceRollout,
};

export default function ActionDetails() {
  const data = useRecipeDetailsData();
  const [mode, setMode] = React.useState(MODE_RICH);

  const generateHandlerModeClick = (newMode) => {
    return () => {
      setMode(newMode);
    };
  };

  let details = null;
  if (mode === MODE_RAW) {
    details = <RawDetails />;
  } else if (mode === MODE_RICH) {
    if (data.action.name in ACTION_DETAILS_MAPPING) {
      const DetailsComponent = ACTION_DETAILS_MAPPING[data.action.name];
      details = <DetailsComponent data={data} />;
    } else {
      details = <Generic data={data.arguments} />;
    }
  }

  return (
    <CollapsibleSection
      headerButtons={
        <ButtonGroup>
          <ModePopover message="Display the rich details">
            <IconButton
              active={mode === MODE_RICH}
              icon={<Icon icon="file-text-o" />}
              onClick={generateHandlerModeClick(MODE_RICH)}
            />
          </ModePopover>
          <ModePopover message="Display the raw details">
            <IconButton
              active={mode === MODE_RAW}
              icon={<Icon icon="code" />}
              onClick={generateHandlerModeClick(MODE_RAW)}
            />
          </ModePopover>
        </ButtonGroup>
      }
      title={
        <>
          <h6>Action</h6>
          <div className="flex-grow-1 px-2">
            <Tag>{data.action.name}</Tag>
          </div>
        </>
      }
    >
      <div className="py-1 pl-4">{details}</div>
    </CollapsibleSection>
  );
}

function ModePopover({ children, message }) {
  const popover = <Popover>{message}</Popover>;

  return (
    <Whisper placement="autoVerticalEnd" speaker={popover} trigger="hover">
      {children}
    </Whisper>
  );
}

ModePopover.propTypes = {
  children: PropTypes.any,
  message: PropTypes.string,
};

function RawDetails() {
  const data = useRecipeDetailsData();

  return (
    <div className="pt-2">
      <Highlight className="javascript">
        {JSON.stringify(data.arguments, null, 2)}
      </Highlight>
    </div>
  );
}
