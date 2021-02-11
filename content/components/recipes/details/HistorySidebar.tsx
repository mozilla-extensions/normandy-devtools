import React from "react";
import { Timeline } from "rsuite";

import HistoryTimelineItem from "devtools/components/recipes/details/HistoryTimelineItem";
import { useRecipeDetailsState } from "devtools/contexts/recipeDetails";

interface HistorySidebarProps {
  open: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ open }) => {
  const { history: recipeHistory } = useRecipeDetailsState();

  return (
    <div className={`history-timeline app-sidebar ${open ? "open" : ""}`}>
      <h6 className="mb-3">History</h6>
      <Timeline>
        {recipeHistory.map((item, idx) => (
          <HistoryTimelineItem
            key={idx}
            number={recipeHistory.length - idx}
            revision={item}
          />
        ))}
      </Timeline>
    </div>
  );
};

export default HistorySidebar;
