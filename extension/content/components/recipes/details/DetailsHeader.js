import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Button, Icon, IconButton, Popover, Whisper } from "rsuite";

import {
  useSelectedEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function DetailsHeader() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { recipeId, revisionId } = useParams();
  const {
    environment,
    selectedKey: environmentKey,
  } = useSelectedEnvironmentState();
  const history = useHistory();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const handleEditClick = () => {
    history.push(`/${environmentKey}/recipes/${recipeId}/edit`);
  };

  const handleCopyClick = () => {
    history.push({
      pathname: `/${environmentKey}/recipes/${recipeId}/clone`,
    });
  };

  const handleBackClick = () => {
    history.push(`/${environmentKey}/recipes`);
  };

  const handleRequestApprovalClick = async () => {
    const approvalRequest = await normandyApi.requestApproval(data.id);
    dispatch({
      data: {
        ...data,
        approval_request: approvalRequest,
      },
      type: ACTION_UPDATE_DATA,
    });
  };

  const handleEnableClick = async () => {
    const updatedRecipe = await normandyApi.enableRecipe(data.recipe.id);
    dispatch({
      data: updatedRecipe.approved_revision,
      type: ACTION_UPDATE_DATA,
    });
  };

  const handleDisableClick = async () => {
    const updatedRecipe = await normandyApi.disableRecipe(data.recipe.id);
    dispatch({
      data: updatedRecipe.approved_revision,
      type: ACTION_UPDATE_DATA,
    });
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

  let requestApprovalButton = null;
  let statusToggleButton = null;
  if (!revisionId) {
    if (!data.approval_request) {
      requestApprovalButton = (
        <IconButton
          className="ml-1"
          icon={<Icon icon="question-circle2" />}
          onClick={handleRequestApprovalClick}
        >
          Request Approval
        </IconButton>
      );
    } else if (data.approval_request.approved) {
      if (data.enabled) {
        statusToggleButton = (
          <IconButton
            className="ml-1"
            color="red"
            icon={<Icon icon="close-circle" />}
            onClick={handleDisableClick}
          >
            Disable
          </IconButton>
        );
      } else {
        statusToggleButton = (
          <IconButton
            className="ml-1"
            color="green"
            icon={<Icon icon="check-circle" />}
            onClick={handleEnableClick}
          >
            Enable
          </IconButton>
        );
      }
    }
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
        {requestApprovalButton}
        {statusToggleButton}
        <IconButton
          appearance="primary"
          className="ml-1"
          icon={<Icon icon="edit2" />}
          onClick={handleEditClick}
        >
          Edit Recipe
        </IconButton>
        <Whisper
          placement="bottomEnd"
          speaker={
            <Popover>
              <Button appearance="subtle" onClick={handleCopyClick}>
                Clone Experiment
              </Button>
            </Popover>
          }
          trigger="click"
        >
          <div className="ml-1">
            <Icon icon="ellipsis-h" />
          </div>
        </Whisper>
      </div>
    </div>
  );
}
