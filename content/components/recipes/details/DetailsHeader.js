import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Button, Icon, IconButton, Popover, Whisper } from "rsuite";

import TelemetryLink from "devtools/components/recipes/details/TelemetryLink";
import {
  useSelectedEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { actionIsPausable } from "devtools/utils/recipes";

export default function DetailsHeader() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  // @ts-ignore
  const { recipeId, revisionId } = useParams();
  const {
    environment,
    selectedKey: environmentKey,
  } = useSelectedEnvironmentState();
  const history = useHistory();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [buttonsLoading, setButtonsLoading] = React.useState(new Set());

  const addButtonLoading = (buttonName) => {
    const newLoading = new Set(buttonsLoading);
    newLoading.add(buttonName);
    setButtonsLoading(newLoading);
  };

  const removeButtonLoading = (buttonName) => {
    const newLoading = new Set(buttonsLoading);
    newLoading.delete(buttonName);
    setButtonsLoading(newLoading);
  };

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
    addButtonLoading("request-approval");
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
      removeButtonLoading("request-approval");
    }
  };

  const handleEnableClick = async () => {
    addButtonLoading("enable");
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
      removeButtonLoading("enable");
    }
  };

  const handleDisableClick = async () => {
    addButtonLoading("disable");
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
      removeButtonLoading("disable");
    }
  };

  const handlePauseClick = async () => {
    addButtonLoading("pause");
    try {
      const updatedData = await normandyApi.patchRecipe(data.recipe.id, {
        comment: "One-click pause",
        arguments: {
          // Normandy's PATCH does not recurse into individual fields, so include all of the arguments
          ...data.arguments,
          isEnrollmentPaused: true,
        },
      });
      const approvalRequest = await normandyApi.requestApproval(
        updatedData.latest_revision.id,
      );
      dispatch({
        data: {
          ...updatedData.latest_revision,
          approval_request: approvalRequest,
        },
        type: ACTION_UPDATE_DATA,
      });
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${err.message}`, 5000);
    } finally {
      removeButtonLoading("pause");
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

  let telemetryLink = null;
  const experimentData = useExperimenterDetailsData();
  if (environment.experimenterUrl && data.experimenter_slug) {
    telemetryLink = <TelemetryLink {...experimentData} />;
  }

  let requestApprovalButton = null;
  let statusToggleButton = null;
  if (!revisionId) {
    if (!data.approval_request) {
      requestApprovalButton = (
        <IconButton
          className="ml-1"
          disable={buttonsLoading.size > 0}
          icon={<Icon icon="question-circle2" />}
          loading={buttonsLoading.has("approval-request")}
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
            disable={buttonsLoading.size > 0}
            icon={<Icon icon="close-circle" />}
            loading={buttonsLoading.has("disable")}
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
            disable={buttonsLoading.size > 0}
            icon={<Icon icon="check-circle" />}
            loading={buttonsLoading.has("enable")}
            onClick={handleEnableClick}
          >
            Enable
          </IconButton>
        );
      }
    }
  }

  let pauseButton = null;
  if (
    actionIsPausable(data.action?.name) &&
    !data.arguments.isEnrollmentPaused
  ) {
    pauseButton = (
      <Whisper
        delayShow={500}
        placement="autoVertical"
        speaker={
          <Popover>
            Create a revision that pauses the recipe, and request approval.
          </Popover>
        }
      >
        <IconButton
          color="yellow"
          disabled={buttonsLoading.size > 0}
          icon={<Icon icon="pause-circle" />}
          loading={buttonsLoading.has("pause")}
          onClick={handlePauseClick}
        >
          Pause
        </IconButton>
      </Whisper>
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
        {telemetryLink}
        {pauseButton}
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
          <IconButton className="ml-1" icon={<Icon icon="ellipsis-h" />} />
        </Whisper>
      </div>
    </div>
  );
}
