import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Button,
  ButtonToolbar,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  Input,
  InputPicker,
} from "rsuite";

import {
  useSelectedNormandyEnvironmentAPI,
  useSelectedExperimenterEnvironmentAPI,
} from "devtools/contexts/environment";
import CodeMirror from "devtools/components/common/CodeMirror";
import FilterObjects from "devtools/components/recipes/FilterObjects";
import JsonEditor from "devtools/components/common/JsonEditor";

export default function RecipeEditor(props) {
  const { match } = props;
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const experimenterAPI = useSelectedExperimenterEnvironmentAPI();
  const [data, setData] = useState({ arguments: {} });
  const [importInstructions, setImportInstructions] = useState();
  const [actions, setActions] = useState([]);
  const [filters, setFilters] = useState({});

  async function getActionsOptions() {
    const res = await normandyApi.fetchActions();
    const actions = res.results.map((action) => ({
      label: action.name,
      value: action.id,
    }));

    setActions(actions);
  }

  async function getNormandyRecipe(id) {
    const recipe = await normandyApi.fetchRecipe(id);
    setData(recipe.latest_revision);
  }

  async function getExperimentRecipe(slug) {
    const recipe = await experimenterAPI.fetchRecipe(slug);
    const { comment, ...cleanedRecipe } = recipe;
    setImportInstructions(comment);
    setData(cleanedRecipe);
  }

  async function getRecipe(match) {
    if (match.params.id) {
      getRecipe(match.params.id);
      return getNormandyRecipe(match.params.id);
    }
    if (match.params.slug) {
      return getExperimentRecipe(match.params.slug);
    }

    return null;
  }

  async function getFilterOptions() {
    const res = await normandyApi.fetchFilters();
    const filters = {
      countries: res.countries.map((entry) => {
        return { label: `${entry.key}(${entry.value})`, value: `${entry.key}` };
      }),
      locales: res.locales.map((entry) => {
        return { label: `${entry.key}(${entry.value})`, value: `${entry.key}` };
      }),
    };
    setFilters(filters);
  }

  useEffect(() => {
    getActionsOptions();
    getFilterOptions();
    getRecipe(match);
  }, []);

  const handleActionIDChange = (value, event) => {
    setData({
      ...data,
      action: {
        ...data.action,
        id: value,
        name: event.target.innerText,
      },
    });
  };

  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const getRecipeAction = (data) => {
    if (data.action) {
      return data.action.id;
    }
    if (data.action_name) {
      const action = actions.find((entry) => {
        return entry.label === data.action_name;
      });
      if (action) {
        handleActionIDChange(action.value);
        return action.value;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    const id = match.params.id;
    try {
      if (importInstructions) {
        throw Error("Import Instructions not empty!");
      }
      const requestBody = formatRequestBody();

      const requestSave = normandyApi.saveRecipe(id, requestBody);

      requestSave
        .then(() => {
          location.replace("/content.html#");
          Alert.success("Changes Saved");
        })
        .catch((err) => {
          Alert.error(`An Error Occurred: ${JSON.stringify(err.data)}`, 5000);
        });
    } catch (err) {
      Alert.error(err.message);
    }
  };

  const formatRequestBody = () => {
    /* eslint-disable no-unused-vars */
    const { comment: _omitComment, ...cleanedData } = data;
    /* eslint-enable no-unused-vars */
    cleanedData.action_id = data.action.id;
    return cleanedData;
  };

  const getImportInstructionsInfo = () => {
    if (match.params.slug) {
      return (
        <FormGroup hidden={!match.params.slug}>
          <ControlLabel>Import Instuctions</ControlLabel>
          <Input
            componentClass="textarea"
            rows={3}
            value={importInstructions}
            onChange={(value) => setImportInstructions(value)}
          />
        </FormGroup>
      );
    }
    return null;
  };

  return (
    <div className="page-wrapper">
      <Form fluid formValue={data} onChange={(data) => setData(data)}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl name="name" data-testid="recipeName" />
          <HelpBlock>Required</HelpBlock>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Experimenter Slug</ControlLabel>
          <FormControl name="experimenter_slug" data-testid="experimentSlug" />
        </FormGroup>
        <FilterObjects
          filterObjectData={data.filter_object ? data.filter_object : []}
          countryOptions={filters ? filters.countries : []}
          localeOptions={filters ? filters.locales : []}
          handleChange={handleChange}
        />
        <FormGroup>
          <ControlLabel>Extra Filter Expression</ControlLabel>
          <CodeMirror
            options={{
              mode: "javascript",
              lineNumbers: true,
            }}
            value={data.extra_filter_expression}
            onBeforeChange={(editor, data, value) =>
              handleChange("extra_filter_expression", value)
            }
          />
        </FormGroup>
        {getImportInstructionsInfo()}
        <FormGroup>
          <ControlLabel>Actions</ControlLabel>
          <InputPicker
            name={"actionId"}
            placeholder={"Select an action"}
            data={actions}
            block
            value={getRecipeAction(data)}
            onChange={(value, event) => handleActionIDChange(value, event)}
          />
        </FormGroup>
        <ActionArgument
          value={data.arguments}
          action={data.action ? data.action.id : null}
          onChange={(newValue) => handleChange("arguments", newValue)}
        />
        <ButtonToolbar>
          <Button appearance="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button appearance="default" onClick={() => window.history.go(-1)}>
            Cancel
          </Button>
        </ButtonToolbar>
      </Form>
    </div>
  );
}

RecipeEditor.propTypes = {
  match: PropTypes.object,
};

function ActionArgument({ value, onChange, action }) {
  if (!action) {
    return null;
  }

  return (
    <FormGroup>
      <ControlLabel>Action Arguments</ControlLabel>
      <JsonEditor value={value} onChange={(newValue) => onChange(newValue)} />
    </FormGroup>
  );
}

ActionArgument.displayName = "ActionArgument";
ActionArgument.propTypes = {
  action: PropTypes.number,
  value: PropTypes.object,
  onChange: PropTypes.func.required,
};
