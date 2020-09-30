import React from "react";
import { Link } from "react-router-dom";
import { Col, List, Panel, Row, Tag } from "rsuite";

import { RecipeV3 } from "devtools/types/recipes";
import { chunkBy } from "devtools/utils/helpers";

export const PendingReviews: React.FC<any> = (props: {
  data: Array<RecipeV3>;
}) => {
  const { data } = props;
  const pendingReviews = data.filter((recipe) => {
    const {
      latest_revision: { approval_request },
    } = recipe;
    return approval_request && approval_request.approved === null;
  });

  const renderPendingReviewListItem = () => {
    return chunkBy(pendingReviews, 3).map((recipeChunk, rowIdx) => {
      return (
        <Row key={rowIdx}>
          {recipeChunk.map((recipe, colIdx) => (
            <Col key={`col-${colIdx}`} md={8} sm={24}>
              <Link
                to={`recipes/${recipe.id}`}
                style={{ textDecoration: "none" }}
              >
                <Panel className="recipe-listing mb-2" bordered>
                  <Tag className="mr-half" color="violet">
                    {recipe.id}
                  </Tag>
                  {recipe.latest_revision.name}
                </Panel>
              </Link>
            </Col>
          ))}
        </Row>
      );
    });
  };

  return (
    <>
      <h3>Pending Approvals </h3>
      {renderPendingReviewListItem()}
    </>
  );
};
