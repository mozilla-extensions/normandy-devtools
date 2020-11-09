import React from "react";
import { Link } from "react-router-dom";
import { Panel, PanelProps, Tag } from "rsuite";

import { useEnvironmentState } from "devtools/contexts/environment";
import { RecipeV3 } from "devtools/types/recipes";

interface RecipeCardProps extends PanelProps {
  recipe: RecipeV3;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  children,
  className,
  recipe,
  ...props
}) => {
  const environmentState = useEnvironmentState();
  const linkUrl = `/${environmentState.selectedKey}/recipes/${recipe.id}/`;

  return (
    <Panel bordered className={`recipe-listing ${className}`} {...props}>
      <div className="d-flex font-size-larger">
        <div>
          <Link to={linkUrl}>
            <Tag className="mt-0 mr-1" color="violet">
              {recipe.id}
            </Tag>
          </Link>
        </div>
        <div className="font-weight-bold">
          <Link className="text-decoration-none text-default" to={linkUrl}>
            {recipe.latest_revision.name}
          </Link>
        </div>
      </div>
      {children}
    </Panel>
  );
};

export default RecipeCard;
