import React from "react";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import SelectField from "devtools/components/recipes/form/arguments/fields/SelectField";

export default function PreferenceRollback() {
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

  const rolloutOptions = rollouts.map((rollout) => ({
    label: rollout.latest_revision.arguments.slug,
    value: rollout.latest_revision.arguments.slug,
  }));

  return (
    <SelectField label="Rollout" name="rolloutSlug" options={rolloutOptions} />
  );
}
