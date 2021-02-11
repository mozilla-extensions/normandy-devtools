import React from "react";
import { ButtonGroup, Icon, IconButton, Tag } from "rsuite";

import CollapsibleSection, {
  HeaderButtonPopover,
} from "devtools/components/common/CollapsibleSection";
import Highlight from "devtools/components/common/Highlight";
import AddonStudy from "devtools/components/recipes/details/arguments/AddonStudy";
import BranchedAddonStudy from "devtools/components/recipes/details/arguments/BranchedAddonStudy";
import Generic from "devtools/components/recipes/details/arguments/GenericArguments";
import MessagingExperiment from "devtools/components/recipes/details/arguments/MessagingExperiment";
import MultiPreferenceExperiment from "devtools/components/recipes/details/arguments/MultiPreferenceExperiment";
import PreferenceExperiment from "devtools/components/recipes/details/arguments/PreferenceExperiment";
import PreferenceRollout from "devtools/components/recipes/details/arguments/PreferenceRollout";
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

const ActionDetails: React.FC = () => {
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
          <HeaderButtonPopover message="Display the rich details">
            <IconButton
              active={mode === MODE_RICH}
              icon={<Icon icon="file-text-o" />}
              onClick={generateHandlerModeClick(MODE_RICH)}
            />
          </HeaderButtonPopover>
          <HeaderButtonPopover message="Display the raw details">
            <IconButton
              active={mode === MODE_RAW}
              icon={<Icon icon="code" />}
              onClick={generateHandlerModeClick(MODE_RAW)}
            />
          </HeaderButtonPopover>
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
      <div className="py-1 pl-4" data-testid="action-details">
        {details}
      </div>
    </CollapsibleSection>
  );
};

const RawDetails: React.FC = () => {
  const data = useRecipeDetailsData();

  return (
    <div className="pt-2">
      <Highlight className="javascript">
        {JSON.stringify(data.arguments, null, 2)}
      </Highlight>
    </div>
  );
};

export default ActionDetails;
