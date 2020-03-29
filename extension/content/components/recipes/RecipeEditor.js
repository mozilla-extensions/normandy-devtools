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
  InputPicker,
} from "rsuite";
import { Controlled as CodeMirror } from "react-codemirror2";
import {
  useEnvironments,
  useEnvironmentState,
  useSelectedEnvironment,
  useSelectedEnvironmentAPI,
  useSelectedEnvironmentAuth,
} from "devtools/contexts/environment";

function RecipeEditor(props) {
  const { match, environment, api, auth } = props;
  let [data, setData] = useState({});
  let [actions, setActions] = useState([]);

  async function getActionsOptions(environment) {
    let res = await api.fetchActions(3);
    actions = res.results.map(action => ({
      label: action.name,
      value: action.id,
    }));
    setActions(actions);
  }

  async function getRecipe(id) {
    let recipe = await api.fetchRecipe(id, 3);
    const { latest_revision } = recipe;
    latest_revision.arguments = JSON.stringify(
      latest_revision.arguments,
      null,
      1,
    );
    latest_revision.action_id = latest_revision.action.id;
    delete latest_revision.comment;
    setData(latest_revision);
  }

  useEffect(() => {
    getActionsOptions(environment);
    if (match.params.id) {
      getRecipe(match.params.id);
    }
  }, []);

  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const handleSubmit = () => {
    let recipeEndpoint = "recipe/";
    let method = "POST";
    if (match.params.id) {
      recipeEndpoint = `recipe/${match.params.id}/`;
      method = "PUT";
    }
    const token = auth.result.accessToken;
    const requestBody = formatRequestBody();
    const requestSave = api.request({
      version: 3,
      url: recipeEndpoint,
      extraHeaders: {
        Authorization: "Bearer " + token,
      },

      method: method,
      data: requestBody,
    });
    requestSave
      .then(() => {
        location.replace("/content.html#");
        Alert.success("Changes Saved");
      })
      .catch(err => {
        Alert.error(`An Error Occured: ${JSON.stringify(err.data)}`);
      });
  };

  const formatRequestBody = () => {
    const dataCopy = JSON.parse(JSON.stringify(data));
    try {
      dataCopy.arguments = JSON.parse(dataCopy.arguments);
    } catch (err) {
      Alert.error("Arguments is not valid JSON");
    }
    return dataCopy;
  };

  return (
    <div className="page-wrapper">
      <Form fluid formValue={data} onChange={data => setData(data)}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl name="name" />
          <HelpBlock>Required</HelpBlock>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Experiment Slug</ControlLabel>
          <FormControl name="experimenter_slug" />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Extra Filter Expression</ControlLabel>
          <CodeMirror
            name="extra_filter_expression"
            options={{
              mode: "javascript",
              theme: "neo",
              lineNumbers: true,
              lineWrapping: true,
              styleActiveLine: true,
            }}
            style={{
              height: "auto",
            }}
            value={data.extra_filter_expression}
            onBeforeChange={(editor, data, value) =>
              handleChange("extra_filter_expression", value)
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Actions</ControlLabel>
          <FormControl
            name={"action_id"}
            placeholder={"Actions"}
            data={actions}
            searchable={false}
            size="lg"
            block
            accepter={InputPicker}
          />
        </FormGroup>
        <ActionArgument
          name="arguments"
          value={data.arguments}
          handleChange={handleChange}
          action={data.action_id}
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

function ActionArgument(props) {
  if (props.action) {
    return (
      <FormGroup>
        <ControlLabel>Action Arguments</ControlLabel>
        <CodeMirror
          name={props.name}
          options={{
            mode: "javascript",
            theme: "neo",
            lineNumbers: true,
            lineWrapping: true,
            styleActiveLine: true,
          }}
          style={{
            height: "auto",
          }}
          value={props.value}
          onBeforeChange={(editor, data, value) =>
            props.handleChange(props.name, value)
          }
        />
      </FormGroup>
    );
  }
  return "";
}

RecipeEditor.propTypes = {
  match: PropTypes.object,
  environment: PropTypes.object,
};

export default function WrappedRecipePage(props) {
  const { selectedKey } = useEnvironmentState();
  const environment = useSelectedEnvironment();
  const environments = useEnvironments();
  const api = useSelectedEnvironmentAPI();
  const auth = useSelectedEnvironmentAuth();
  return (
    <RecipeEditor
      {...props}
      environmentKey={selectedKey}
      environment={environment}
      environments={environments}
      auth={auth}
      api={api}
    />
  );
}
