import React from "react";
import PropTypes from "prop-types";
import { ButtonGroup, Icon, IconButton, Popover, Tag, Whisper } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Highlight from "devtools/components/common/Highlight";
import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import PreferenceExperiment from "devtools/components/recipes/details/arguments/PreferenceExperiment";

const MODE_RICH = "RICH";
const MODE_RAW = "RAW";

const ACTION_DETAILS_MAPPING = {
  "preference-experiment": PreferenceExperiment,
};

export default function ActionDetails() {
  const data = useRecipeDetailsData();
  const [mode, setMode] = React.useState(MODE_RICH);

  const handleModeClick = (newMode) => {
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
      details = <DetailsComponent />;
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
              onClick={handleModeClick(MODE_RICH)}
            />
          </ModePopover>
          <ModePopover message="Display the raw details">
            <IconButton
              active={mode === MODE_RAW}
              icon={<Icon icon="code" />}
              onClick={handleModeClick(MODE_RAW)}
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
