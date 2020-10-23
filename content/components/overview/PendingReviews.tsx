import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Col, Panel, Row, Tag } from "rsuite";

import { RecipeV3 } from "devtools/types/recipes";
import { chunkBy } from "devtools/utils/helpers";

export const PendingReviews: React.FC<{ data: Array<RecipeV3> }> = ({
  data,
}) => {
  const pendingReviews = data.filter((recipe) => {
    return recipe.latest_revision.approval_request?.approved === null;
  });

  const renderPendingReviewListItem = (): Array<ReactElement> => {
    return chunkBy(pendingReviews, 3).map((recipeChunk, rowIdx) => {
      return (
        <Row key={rowIdx}>
          {recipeChunk.map((recipe, colIdx) => (
            <Col key={`col-${colIdx}`} md={8} sm={24}>
              <Link
                className="text-decoration-none"
                to={`recipes/${recipe.id}`}
              >
                <Panel bordered className="recipe-listing mb-2">
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
