import React from "react";
import PropTypes from "prop-types";
import { ButtonGroup, Icon, IconButton, Popover, Whisper } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Highlight from "devtools/components/common/Highlight";
import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";

const MODE_RICH = "RICH";
const MODE_RAW = "RAW";
const MODE_COMPOSITE = "COMPOSITE";

export default function FilteringDetails() {
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
  }

  let filterExpression = null;
  if (mode === MODE_COMPOSITE) {
    filterExpression = (
      <div className="mt-4">
        <strong>Filter Expression</strong>
        <Highlight className="javascript">{data.filter_expression}</Highlight>
      </div>
    );
  } else if (data.extra_filter_expression) {
    filterExpression = (
      <div className="mt-4">
        <strong>Extra Filter Expression</strong>
        <Highlight className="javascript">
          {data.extra_filter_expression}
        </Highlight>
      </div>
    );
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
          <ModePopover message="Display the composite details">
            <IconButton
              active={mode === MODE_COMPOSITE}
              icon={<Icon icon="calculator" />}
              onClick={handleModeClick(MODE_COMPOSITE)}
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
      title={<h6 className="flex-grow-1">Filtering</h6>}
    >
      <div className="py-1 pl-4">
        {filterExpression}
        {details}
      </div>
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
    <div className="mt-4">
      <strong>Filter Objects</strong>
      <Highlight className="javascript">
        {JSON.stringify(data.filter_object, null, 2)}
      </Highlight>
    </div>
  );
}
