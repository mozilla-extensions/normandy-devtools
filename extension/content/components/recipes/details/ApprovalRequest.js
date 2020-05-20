// @ts-nocheck
import React from "react";
import { Button, Divider, Input, Tag } from "rsuite";

import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";

export default function ApprovalRequest() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const [comment, updateComment] = React.useState("");

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

  const handleClickApprove = async () => {
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
  };

  const handleClickReject = async () => {
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
  };

  const handleClickCancel = async () => {
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
          <Button color="green" onClick={handleClickApprove}>
            Approve
          </Button>
          <Button className="ml-1" color="red" onClick={handleClickReject}>
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
}
