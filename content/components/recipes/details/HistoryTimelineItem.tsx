import dayjs from "dayjs";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Popover, Tag, Timeline, Whisper } from "rsuite";

import { useSelectedEnvironmentState } from "devtools/contexts/environment";
import { useRecipeDetailsState } from "devtools/contexts/recipeDetails";
import { Revision } from "devtools/types/recipes";

interface HistoryTimelineItemProps {
  number: number;
  revision: Revision;
}

const HistoryTimelineItem: React.FC<HistoryTimelineItemProps> = ({
  number,
  revision,
}) => {
  const { selectedKey: environmentKey } = useSelectedEnvironmentState();
  const { recipeId } = useParams<{
    recipeId: string;
  }>();
  const history = useHistory();
  const { data: recipeData, statusData } = useRecipeDetailsState();

  let tag = null;
  if (
    revision.approval_request?.approved &&
    statusData.enabled &&
    statusData.id === revision.id
  ) {
    tag = <Tag className="ml-1 bg-green">Live</Tag>;
  }

  const dotClassNames = ["timeline-dot"];
  if (revision.approval_request?.approved) {
    dotClassNames.push("approved");
  } else if (revision.approval_request?.approved === false) {
    dotClassNames.push("rejected");
  }

  if (recipeData.id === revision.id) {
    dotClassNames.push("selected");
  }

  const dot = <span className={dotClassNames.join(" ")} />;

  const handleClick = (): void => {
    history.push(
      `/${environmentKey}/recipes/${recipeId}/revision/${revision.id}/`,
    );
  };

  const classNames = ["cursor-pointer"];
  if (recipeData.id === revision.id) {
    classNames.push("font-weight-bold");
  }

  const tooltip = (
    <Popover className="ml-2 history-timeline-tooltip">
      <>
        <dl>
          <dt>Comment</dt>
          <dd className="text-subtle p-0">
            {revision.comment || <em>No comment.</em>}
          </dd>

          <dt>Created by</dt>
          <dd className="text-subtle">{revision.creator.email}</dd>

          <dt>Created at</dt>
          <dd className="text-subtle">
            {dayjs(revision.date_created).format("MMMM D, YYYY @ h:mma")}
          </dd>
        </dl>
      </>
    </Popover>
  );

  return (
    <Timeline.Item
      className={classNames.join(" ")}
      dot={dot}
      onClick={handleClick}
    >
      <Whisper placement="rightStart" speaker={tooltip} trigger="hover">
        <span>
          Revision {number} {tag}
        </span>
      </Whisper>
    </Timeline.Item>
  );
};

export default HistoryTimelineItem;
