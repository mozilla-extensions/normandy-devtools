import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Icon, IconButton } from "rsuite";

import {
  useEnvironmentState,
  useSelectedEnvironment,
} from "devtools/contexts/environment";
import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";

export default function DetailsHeader() {
  const data = useRecipeDetailsData();
  const { recipeId } = useParams();
  const environment = useSelectedEnvironment();
  const { selectedKey: environmentKey } = useEnvironmentState();
  const history = useHistory();

  const handleEditClick = () => {
    history.push(`/${environmentKey}/recipes/${recipeId}/edit`);
  };

  const handleBackClick = () => {
    history.push(`/${environmentKey}/recipes`);
  };

  let viewExperimentButton = null;
  if (environment.experimenterUrl && data.experimenter_slug) {
    viewExperimentButton = (
      <IconButton
        appearance="subtle"
        componentClass="a"
        href={`${environment.experimenterUrl}experiments/${data.experimenter_slug}`}
        icon={<Icon icon="external-link" />}
        target="_blank"
      >
        View Experiment
      </IconButton>
    );
  }

  return (
    <div className="page-header">
      <div className="flex-grow-1">
        <IconButton
          appearance="subtle"
          icon={<Icon icon="back-arrow" />}
          onClick={handleBackClick}
        >
          Back
        </IconButton>
      </div>
      <div className="d-flex align-items-center text-right">
        {viewExperimentButton}
        <IconButton
          appearance="primary"
          className="ml-1"
          icon={<Icon icon="edit2" />}
          onClick={handleEditClick}
        >
          Edit Recipe
        </IconButton>
      </div>
    </div>
  );
}
