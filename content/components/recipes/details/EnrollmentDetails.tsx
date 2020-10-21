import React from "react";

import CollapsibleSection from "devtools/components/recipes/details/CollapsibleSection";
import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";

const EnrollmentDetails: React.FunctionComponent = () => {
  const server = "https://stage.grafana.nonprod.dataops.mozgcp.net";
  const snapshot = "QZ3X0hpzQ67uBbvbPD02cE5Wqa0yRCar";
  const { experimenter_slug: slug } = useRecipeDetailsData();

  const url = `${server}/dashboard/snapshot/${snapshot}?var-experiment_id=${slug}`;

  return (
    <CollapsibleSection
      collapsed={true}
      headerButtons={<></>}
      title={<h6>Enrollment Details</h6>}
    >
      <div className="py-1 pl-4">
        <div className="mt-4">
          {slug ? <iframe height="800" src={url} width="100%"></iframe> : "N/A"}
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default EnrollmentDetails;
