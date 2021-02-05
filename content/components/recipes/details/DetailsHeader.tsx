import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Icon, IconButton, Nav, Popover, Whisper } from "rsuite";

import TelemetryLink, {
  TelemetryLinkTypes,
} from "devtools/components/recipes/details/TelemetryLink";
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

interface DetailsHeaderProps {
  onClickHistoryButton: () => void;
}

const DetailsHeader: React.FC<DetailsHeaderProps> = ({
  onClickHistoryButton,
}) => {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { recipeId, revisionId } = useParams<{
    recipeId: string;
    revisionId: string;
  }>();
  const {
    environment,
    selectedKey: environmentKey,
  } = useSelectedEnvironmentState();
  const history = useHistory();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [buttonsLoading, setButtonsLoading] = React.useState(new Set());

  const addButtonLoading = (buttonName): void => {
    const newLoading = new Set(buttonsLoading);
    newLoading.add(buttonName);
    setButtonsLoading(newLoading);
  };

  const removeButtonLoading = (buttonName): void => {
    const newLoading = new Set(buttonsLoading);
    newLoading.delete(buttonName);
    setButtonsLoading(newLoading);
  };

  const handleEditClick = (): void => {
    history.push(`/${environmentKey}/recipes/${recipeId}/edit`);
  };

  const handleCopyClick = (): void => {
    history.push({
      pathname: `/${environmentKey}/recipes/${recipeId}/clone`,
    });
  };

  const handleBackClick = (): void => {
    history.push(`/${environmentKey}/recipes`);
  };

  const handleRequestApprovalClick = async (): Promise<void> => {
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

  const handleEnableClick = async (): Promise<void> => {
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

  const handleDisableClick = async (): Promise<void> => {
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

  const handlePauseClick = async (): Promise<void> => {
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

  let experimenterLink = null;
  let telemetryLink = null;
  if (environment.experimenterUrl && data.experimenter_slug) {
    experimenterLink = (
      <Nav.Item
        componentClass="a"
        href={`${environment.experimenterUrl}experiments/${data.experimenter_slug}`}
        target="_blank"
      >
        View in Experimenter
      </Nav.Item>
    );
    telemetryLink = (
      <TelemetryLink
        {...useExperimenterDetailsData()}
        appearance="subtle"
        type={TelemetryLinkTypes.navItem}
      >
        View Telemetry
      </TelemetryLink>
    );
  }

  let requestApprovalButton = null;
  let statusToggleButton = null;
  if (!revisionId) {
    if (!data.approval_request) {
      requestApprovalButton = (
        <IconButton
          className="ml-1"
          disabled={buttonsLoading.size > 0}
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
            disabled={buttonsLoading.size > 0}
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
            disabled={buttonsLoading.size > 0}
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
          speaker={<Popover>Show history.</Popover>}
          trigger="hover"
        >
          <IconButton
            className="ml-1"
            icon={<Icon icon="history" />}
            onClick={onClickHistoryButton}
          />
        </Whisper>
        <Whisper
          placement="bottomEnd"
          speaker={
            <Popover>
              <Nav vertical>
                <Nav.Item onClick={handleCopyClick}>Clone Experiment</Nav.Item>
                {experimenterLink}
                {telemetryLink}
              </Nav>
            </Popover>
          }
          trigger="click"
        >
          <IconButton className="ml-1" icon={<Icon icon="ellipsis-h" />} />
        </Whisper>
      </div>
    </div>
  );
};

export default DetailsHeader;
