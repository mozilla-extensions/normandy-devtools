import React from "react";
import { HelpBlock } from "rsuite";

import { useRecipeDetailsErrors } from "devtools/contexts/recipeDetails";

type ServerErrorsProps = {
  field: string;
};

// export default
const ServerErrors: React.FC<ServerErrorsProps> = ({ field }) => {
  const { serverErrors } = useRecipeDetailsErrors();

  const { [field]: fieldErrors = [] } = serverErrors;
  if (!fieldErrors.length) {
    return null;
  }

  return (
    <HelpBlock className="text-red">
      {fieldErrors.map((err) => {
        return <li key={err}>{err}</li>;
      })}
    </HelpBlock>
  );
};

export default ServerErrors;
