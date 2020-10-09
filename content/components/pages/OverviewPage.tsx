import React from "react";
import { Loader } from "rsuite";

import { PendingReviews } from "../overview/PendingReviews";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";

export const OverviewPage: React.FC = () => {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    getPendingReviews();
  }, [environmentKey]);

  const getPendingReviews = async (): Promise<void> => {
    const approvalRequests = await normandyApi.fetchApprovalRequests({
      approved: "pending",
    });

    const recipeList = [];

    if (approvalRequests.length) {
      await Promise.all(
        approvalRequests.map(async (approvalRequest) => {
          const {
            revision: { recipe_id },
          } = approvalRequest;
          const recipe = await normandyApi.fetchRecipe(recipe_id);
          recipeList.push(recipe);
        }),
      );
    }

    setData(recipeList);
  };

  if (data.length) {
    return (
      <div className="page-wrapper">
        <PendingReviews data={data} />
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader content="Loading Overview&hellip;" />
    </div>
  );
};
