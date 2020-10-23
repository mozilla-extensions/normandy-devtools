import React from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Divider, Input, Tag } from "rsuite";

import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

const ApprovalRequest: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const [comment, updateComment] = React.useState("");
  const [isApproving, setIsApproving] = React.useState(false);
  const [isRejecting, setIsRejecting] = React.useState(false);

  if (!data.approval_request) {
    return null;
  }

  const approvalRequest = data.approval_request;
  let statusTag = <Tag color="yellow">Pending</Tag>;
  if (approvalRequest.approved) {
    statusTag = <Tag color="green">Approved</Tag>;
  } else if (approvalRequest.approved === false) {
    statusTag = <Tag color="red">Rejected</Tag>;
  }

  const handleClickApprove = async (): Promise<void> => {
    setIsApproving(true);
    try {
      const updatedApprovalRequest = await normandyApi.approveApprovalRequest(
        approvalRequest.id,
        comment,
      );
      dispatch({
        data: {
          ...data,
          approval_request: updatedApprovalRequest,
        },
        type: ACTION_UPDATE_DATA,
      });
      normandyApi.fetchRecipe(recipeId).then((recipeData) => {
        dispatch({
          data: recipeData.latest_revision,
          statusData:
            recipeData.approved_revision || recipeData.latest_revision,
          type: ACTION_UPDATE_DATA,
        });
      });
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${err.message}`, 5000);
    } finally {
      setIsApproving(false);
    }
  };

  const handleClickReject = async (): Promise<void> => {
    setIsRejecting(true);
    try {
      const updatedApprovalRequest = await normandyApi.rejectApprovalRequest(
        approvalRequest.id,
        comment,
      );
      dispatch({
        data: {
          ...data,
          approval_request: updatedApprovalRequest,
        },
        type: ACTION_UPDATE_DATA,
      });
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${err.message}`, 5000);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleClickCancel = async (): Promise<void> => {
    await normandyApi.closeApprovalRequest(approvalRequest.id);
    dispatch({
      data: {
        ...data,
        approval_request: null,
      },
      type: ACTION_UPDATE_DATA,
    });
  };

  let requestDetails = (
    <>
      <div className="d-flex mt-4">
        <strong className="w-120px">Requested by:</strong>
        <div className="flex-grow-1">{approvalRequest.creator.email}</div>
      </div>
      <div className="mt-4">
        <strong>Comment:</strong>
        <div className="my-1">
          <Input block value={comment} onChange={updateComment} />
        </div>
      </div>
      <div className="d-flex mt-2">
        <div className="flex-grow-1">
          <Button
            color="green"
            disabled={isApproving || isRejecting}
            loading={isApproving}
            onClick={handleClickApprove}
          >
            Approve
          </Button>
          <Button
            className="ml-1"
            color="red"
            disabled={isRejecting || isApproving}
            loading={isRejecting}
            onClick={handleClickReject}
          >
            Reject
          </Button>
        </div>
        <div className="pl-2">
          <Button onClick={handleClickCancel}>Cancel Request</Button>
        </div>
      </div>
    </>
  );
  if (approvalRequest.approved !== null) {
    requestDetails = (
      <>
        <div className="d-flex mt-4">
          <strong className="w-120px">Requested by:</strong>
          <div className="flex-grow-1">{approvalRequest.creator.email}</div>
        </div>
        <div className="d-flex mt-1">
          <strong className="w-120px">
            {approvalRequest.approved ? "Approved" : "Rejected"} by:
          </strong>
          <div className="flex-grow-1">{approvalRequest.approver.email}</div>
        </div>
        <div className="d-flex mt-1">
          <strong className="w-120px">Comment:</strong>
          <div className="flex-grow-1">{approvalRequest.comment}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <CollapsibleSection
        collapsed
        testId="collapse-approval-request"
        title={
          <>
            <h6>Approval Request</h6>
            <div className="flex-grow-1 px-2">{statusTag}</div>
          </>
        }
      >
        <div className="py-1 pl-4">{requestDetails}</div>
      </CollapsibleSection>
      <Divider />
    </>
  );
};

export default ApprovalRequest;
