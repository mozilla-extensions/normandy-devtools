import React, { ReactElement } from "react";

import SelectField from "devtools/components/recipes/form/arguments/fields/SelectField";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";

export default function PreferenceRollback(): ReactElement {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const [rollouts, setRollouts] = React.useState([]);
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  React.useEffect(() => {
    normandyApi
      .fetchAllRecipes({ action: "preference-rollout" })
      .then((allRollouts) => {
        setRollouts(allRollouts);
      });
  }, [environmentKey]);

  const rolloutData: Array<{
    label: string;
    value: string;
  }> = rollouts.map((rollout) => ({
    label: `${rollout.id}: ${rollout.latest_revision.name} `,
    value: rollout.latest_revision.arguments.slug,
  }));

  const rolloutMenu = (label, item): ReactElement => {
    return (
      <div>
        {label}
        <small style={{ opacity: 0.5, fontSize: "95%" }}>{item.value}</small>
      </div>
    );
  };

  return (
    <SelectField
      searchable
      data={rolloutData}
      label="Rollout"
      name="rolloutSlug"
      renderMenuItem={rolloutMenu}
    />
  );
}
