import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
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

// Keys that are controlled by this component
const RECIPE_QUERY_KEYS: Array<keyof RecipeListQuery> = [
  "page",
  "text",
  "enabled",
  "action",
];

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
  const [draftQuery, setDraftQuery] = useState<RecipeListQuery>(query ?? {});

  // Don't update the parent component for every keypress
  const debouncedSetQuery = useDebouncedCallback(setQuery, 300);
  const history = useHistory();

  // Receive changes to the query from parent components, falling back to the
  // URL state if none is provided.
  useEffect(() => {
    setDraftQuery(
      query ?? getRecipeQueryFromUrlSearch(history.location.search),
    );
    // This is used for an initial sync, and the next hook handles the ongoing
    // updates when history.location changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // As the draft query changes, sync it into the URL
  useEffect(() => {
    const workUrl = new URL(window.location.toString());
    workUrl.search = history.location.search;

    for (const key of RECIPE_QUERY_KEYS) {
      workUrl.searchParams.delete(key);
    }

    for (const [key, val] of Object.entries(convertDraftToQuery(draftQuery))) {
      workUrl.searchParams.set(key, val.toString());
    }

    const target =
      history.location.pathname + workUrl.search + history.location.hash;
    history.replace(target);
  }, [draftQuery, history]);

  // Respond to changes of query parameters in the url
  useEffect(() => {
    const workUrl = new URL(window.location.toString());
    workUrl.search = history.location.search;

    const newQuery = getRecipeQueryFromUrlSearch(history.location.search);
    const hasChanges = Object.entries(newQuery).some(
      ([key, value]) => draftQuery[key] !== value,
    );

    if (hasChanges) {
      setDraftQuery(newQuery);
    }
  }, [draftQuery, history.location.search]);

  // Handle changes to the fields
  function makeHandler(name: keyof RecipeListQuery, { debounce = true } = {}) {
    return (newValue: RecipeListQuery[typeof name]): void => {
      let newQuery: DraftQuery;
      if (newValue === "") {
        newQuery = { ...draftQuery };
        delete newQuery[name];
      } else {
        newQuery = { ...draftQuery, [name]: newValue };
      }

      setDraftQuery(newQuery);
      const translatedQuery = convertDraftToQuery(newQuery);
      delete translatedQuery.page;
      debouncedSetQuery.callback(translatedQuery);
      if (!debounce) {
        debouncedSetQuery.flush();
      }
    };
  }

  const enabledPickerData = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  return (
    <Form className={className} layout="inline">
      <FormGroup controlId="text">
        <ControlLabel>Search</ControlLabel>
        <InputGroup>
          <InputGroup.Addon>
            <Icon icon="search" />
          </InputGroup.Addon>
          <FormControl
            accepter={Input}
            value={draftQuery.text ?? ""}
            onChange={makeHandler("text", { debounce: true })}
            onPressEnter={debouncedSetQuery.flush}
          />
        </InputGroup>
      </FormGroup>
      <FormGroup controlId="enabled">
        <ControlLabel>Enabled</ControlLabel>
        <FormControl
          accepter={InputPicker}
          classPrefix="d-block "
          data={enabledPickerData}
          placeholder="Any"
          value={draftQuery.enabled}
          onChange={makeHandler("enabled", { debounce: false })}
        />
      </FormGroup>
      <FormGroup controlId="action">
        <ControlLabel>Action</ControlLabel>
        <FormControl
          accepter={ActionSelector}
          classPrefix="d-block "
          normandyApi={normandyApi}
          value={draftQuery.action}
          onChangeName={makeHandler("action", { debounce: false })}
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

/**
 * Convert from a DraftQuery, which may include non-standard key values (such as
 * null) to a RecipeQuery, suitable to query Normandy or put in URLs
 * @param draftQuery The query to convert
 */
export function convertDraftToQuery(draftQuery: DraftQuery): RecipeListQuery {
  const rv: RecipeListQuery = {};
  for (const [key, value] of Object.entries(draftQuery)) {
    if (value === null || value === undefined) {
      continue;
    }

    rv[key] = value;
  }

  if (rv.page === 1) {
    delete rv.page;
  }

  return rv;
}

/**
 *
 * @param search The query string to derive the recipe query from. Generally
 *   either `history.location.search` from React Router's `history` or, if that
 *   is not available, `window.location.search`.
 */
export function getRecipeQueryFromUrlSearch(search: string): RecipeListQuery {
  const workUrl = new URL(window.location.toString());
  workUrl.search = search;
  console.log(search);

  const query: RecipeListQuery = {};

  workUrl.searchParams.forEach((value, key) => {
    let processedValue: string | boolean | number | null = value;

    if (key === "enabled") {
      if (processedValue === "true") {
        processedValue = true;
      } else if (processedValue === "false") {
        processedValue = false;
      } else {
        console.warn("enabled is not a boolean");
        processedValue = null;
      }
    }

    if (key === "page") {
      const parsedPage = parseInt(value);
      if (!isNaN(parsedPage)) {
        processedValue = parsedPage === 1 ? null : parsedPage;
      } else {
        console.warn("page is not a number");
        processedValue = null;
      }
    }

    if (
      processedValue !== null &&
      RECIPE_QUERY_KEYS.includes(key as keyof RecipeListQuery)
    ) {
      query[key] = processedValue;
    }
  });

  return query;
}
