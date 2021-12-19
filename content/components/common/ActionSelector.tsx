import React from "react";
import { InputPicker, InputPickerProps } from "rsuite";

import { layoutContext } from "devtools/contexts/layout";
import { Action } from "devtools/types/normandyApi";
import { CompareFunc, makeCompare } from "devtools/utils/helpers";
import NormandyAPI from "devtools/utils/normandyApi";

const actionGroups = {
  "addon-rollback": "Development",
  "addon-rollout": "Development",
  "addon-study": "Legacy",
  "branched-addon-study": "Primary",
  "console-log": "Development",
  "messaging-experiment": "Development",
  "multi-preference-experiment": "Primary",
  "opt-out-study": "Legacy",
  "preference-experiment": "Legacy",
  "preference-rollback": "Primary",
  "preference-rollout": "Primary",
  "show-heartbeat": "Primary",
};

type Props = Omit<InputPickerProps, "data" | "sort" | "onChange"> & {
  value: string;
  normandyApi: NormandyAPI;
  onChangeName?: (newValue: string) => void;
  onChangeAction?: (newValue: Action) => void;
};

// default export
const ActionSelector: React.FC<Props> = ({
  normandyApi,
  onChangeName,
  onChangeAction,
  value,
  placeholder = "Any",
  defaultValue = null,
  ...inputPickerProps
}) => {
  const [actions, setActions] = React.useState<Array<Action>>(null);
  const { container } = React.useContext(layoutContext);

  React.useEffect(() => {
    normandyApi.fetchAllActions().then(setActions);
  }, [normandyApi]);

  interface DataItem {
    value: string;
    label: string;
    group: string;
    groupTitle?: string;
  }

  const actionSelectData: InputPickerProps["data"] = actions?.map(
    (action): DataItem => {
      return {
        value: action.name,
        label: action.name,
        group: actionGroups[action.name],
      };
    },
  );

  const actionGroupOrder = ["Primary", "Development", "Legacy"];

  function sort(isGroup: boolean): CompareFunc<DataItem> {
    if (isGroup) {
      return makeCompare((v) => actionGroupOrder.indexOf(v.groupTitle));
    }

    return makeCompare((v) => v.label);
  }

  function handleChange(newName: string): void {
    if (onChangeName) {
      onChangeName(newName);
    }

    if (onChangeAction) {
      const action = actions.find((a) => a.name === newName);
      onChangeAction(action);
    }
  }

  return (
    <InputPicker
      {...inputPickerProps}
      container={container}
      data={actionSelectData}
      defaultValue={defaultValue}
      groupBy="group"
      placeholder={placeholder}
      sort={sort}
      value={value}
      onChange={handleChange}
    />
  );
};

export default ActionSelector;
