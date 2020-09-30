import React from "react";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { PendingReviews } from "../overview/PendingReviews";
import { Loader } from "rsuite";

export const OverviewPage: React.FC<any> = ({}) => {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  const [data, setData] = React.useState([]);
  React.useEffect(() => {
    getPendingReviews();
  }, [environmentKey]);

  const getPendingReviews = async () => {
    const approvalRequests = await normandyApi.fetchApprovalRequests({
      approved: "pending",
    });

    let recipeList = [];

    if (approvalRequests.length) {
      await Promise.all(
        approvalRequests.map(async (approvalRequest) => {
          const {
            revision: { recipe_id },
          } = approvalRequest;
          const recipe = await normandyApi.fetchRecipe(recipe_id);
          recipeList = [...recipeList, recipe];
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
  } else {
    return (
      <div className="text-center">
        <Loader content="Loading Overview&hellip;" />
      </div>
    );
  }
};
