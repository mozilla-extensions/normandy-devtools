import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Icon, IconButton, Alert } from "rsuite";

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
  const [isButtonLoading, setIsButtonLoading] = React.useState(false);

  const handleEditClick = () => {
    history.push(`/${environmentKey}/recipes/${recipeId}/edit`);
  };

  const handleBackClick = () => {
    history.push(`/${environmentKey}/recipes`);
  };

  const handleRequestApprovalClick = async () => {
    setIsButtonLoading(true);
    try {
      const approvalRequest = await normandyApi.requestApproval(data.id);
      dispatch({
        data: {
          ...data,
          approval_request: approvalRequest,
        },
        type: ACTION_UPDATE_DATA,
      });
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${err.message}`, 5000);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleEnableClick = async () => {
    setIsButtonLoading(true);
    try {
      const updatedRecipe = await normandyApi.enableRecipe(data.recipe.id);
      dispatch({
        data: updatedRecipe.approved_revision,
        type: ACTION_UPDATE_DATA,
      });
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${err.message}`, 5000);
    } finally {
      setIsButtonLoading(false);
    }
  };

  const handleDisableClick = async () => {
    setIsButtonLoading(true);
    try {
      const updatedRecipe = await normandyApi.disableRecipe(data.recipe.id);
      dispatch({
        data: updatedRecipe.approved_revision,
        type: ACTION_UPDATE_DATA,
      });
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${JSON.stringify(err.message)}`, 5000);
    } finally {
      setIsButtonLoading(false);
    }
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
          loading={isButtonLoading}
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
            loading={isButtonLoading}
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
            loading={isButtonLoading}
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
      </div>
    </div>
  );
}
