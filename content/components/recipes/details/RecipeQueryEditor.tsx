import React, { useState } from "react";
import {
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Icon,
  Input,
  InputGroup,
  InputPicker,
} from "rsuite";
import { useDebouncedCallback } from "use-debounce/lib";

import ActionSelector from "devtools/components/common/ActionSelector";
import { RecipeListQuery } from "devtools/types/normandyApi";
import NormandyAPI from "devtools/utils/normandyApi";

interface Props {
  query: RecipeListQuery;
  setQuery: (newQuery: RecipeListQuery) => void;
  normandyApi: NormandyAPI;
  className?: string;
}

// default export
const RecipeQueryEditor: React.FC<Props> = ({
  query,
  setQuery,
  normandyApi,
  className,
}) => {
  const [draftQuery, setDraftQuery] = useState<RecipeListQuery>(query);

  // Don't update the parent component for every keypress
  const debouncedSetQuery = useDebouncedCallback(setQuery, 300);

  function makeHandler(name: keyof RecipeListQuery) {
    return (newValue: RecipeListQuery[typeof name]): void => {
      let newQuery: DraftQuery;
      if (newValue === "") {
        newQuery = { ...draftQuery };
        delete newQuery[name];
      } else {
        newQuery = { ...draftQuery, [name]: newValue };
      }

      setDraftQuery(newQuery);
      debouncedSetQuery.callback(translateQuery(newQuery));
    };
  }

  return (
    <Form className={className} layout="inline">
      <FormGroup>
        <ControlLabel>Search</ControlLabel>
        <InputGroup>
          <InputGroup.Addon>
            <Icon icon="search" />
          </InputGroup.Addon>
          <FormControl
            accepter={Input}
            value={draftQuery.text ?? ""}
            onChange={makeHandler("text")}
            onPressEnter={debouncedSetQuery.flush}
          />
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <ControlLabel>Enabled</ControlLabel>
        <FormControl
          accepter={InputPicker}
          classPrefix="d-block "
          data={[
            {
              value: true,
              label: "Yes",
            },
            {
              value: false,
              label: "No",
            },
          ]}
          placeholder="Any"
          value={draftQuery.enabled}
          onChange={makeHandler("enabled")}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Action</ControlLabel>
        <FormControl
          accepter={ActionSelector}
          classPrefix="d-block "
          normandyApi={normandyApi}
          value={draftQuery.action}
          onChangeName={makeHandler("action")}
        />
      </FormGroup>
    </Form>
  );
};

export default RecipeQueryEditor;

type DraftQuery = Partial<{
  text: string;
  ordering: string;
  enabled: boolean | null;
  action: string;
  page: number;
}>;

function translateQuery(draftQuery: DraftQuery): RecipeListQuery {
  const rv = {};
  for (const [key, value] of Object.entries(draftQuery)) {
    if (value === null || value === undefined) {
      continue;
    }

    rv[key] = value;
  }

  return rv;
}
