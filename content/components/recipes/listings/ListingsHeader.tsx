import React from "react";
import { Link } from "react-router-dom";
import { Icon, IconButton } from "rsuite";

import { useSelectedEnvironmentState } from "devtools/contexts/environment";

interface ListingsHeaderProps {
  setShowWriteRecipes: React.Dispatch<React.SetStateAction<boolean>>;
}

const ListingsHeader: React.FC<ListingsHeaderProps> = ({
  setShowWriteRecipes,
}) => {
  const { selectedKey: environmentKey } = useSelectedEnvironmentState();

  let runButton = null;
  let writeRunButton = null;
  if (environmentKey === "prod" && __ENV__ === "extension") {
    runButton = (
      <IconButton
        className="ml-1"
        color="blue"
        icon={<Icon icon="play" />}
        onClick={() => browser.experiments.normandy.standardRun()}
      >
        Run Normandy
      </IconButton>
    );

    writeRunButton = (
      <IconButton
        appearance="subtle"
        className="ml-1"
        icon={<Icon icon="edit" />}
        onClick={() => setShowWriteRecipes(true)}
      >
        Write & Run Arbitrary
      </IconButton>
    );
  }

  return (
    <div className="page-header">
      <div className="flex-grow-1" />
      <div className="d-flex align-items-center text-right">
        <IconButton
          appearance="subtle"
          className="ml-1"
          componentClass={Link}
          icon={<Icon icon="plus" />}
          to={`/${environmentKey}/recipes/new`}
        >
          Create Recipe
        </IconButton>
        {writeRunButton}
        {runButton}
      </div>
    </div>
  );
};

export default ListingsHeader;
