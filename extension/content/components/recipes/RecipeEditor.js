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
import {
  UnControlled as CodeMirrorUC,
  Controlled as CodeMirror,
} from "react-codemirror2";
import { useSelectedEnvironmentAPI } from "devtools/contexts/environment";

export default function RecipeEditor(props) {
  const { match } = props;
  const api = useSelectedEnvironmentAPI();
  let [data, setData] = useState({});
  let [actions, setActions] = useState([]);

  async function getActionsOptions() {
    let res = await api.fetchActions(3);
    let actions = res.results.map(action => ({
      label: action.name,
      value: action.id,
    }));

    setActions(actions);
  }

  async function getRecipe(id) {
    const recipe = await api.fetchRecipe(id, 3);
    setData(recipe.latest_revision);
  }

  useEffect(() => {
    getActionsOptions();
    if (match.params.id) {
      getRecipe(match.params.id);
    }
  }, []);

  const handleActionIDChange = value => {
    setData({
      ...data,
      action: {
        ...data.action,
        id: value,
      },
    });
  };
  const handleChange = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const handleSubmit = () => {
    const id = match.params.id;
    const requestBody = formatRequestBody();
    const requestSave = api.saveRecipe(id, requestBody);

    requestSave
      .then(() => {
        location.replace("/content.html#");
        Alert.success("Changes Saved");
      })
      .catch(err => {
        Alert.error(`An Error Occurred: ${JSON.stringify(err.data)}`, 5000);
      });
  };

  const formatRequestBody = () => {
    /* eslint-disable no-unused-vars */
    const { ["comment"]: _omitData, ...requestBody } = data;
    /* eslint-enable no-unused-vars */
    requestBody.action_id = data.action.id;
    return requestBody;
  };

  return (
    <div className="page-wrapper">
      <Form fluid formValue={data} onChange={data => setData(data)}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl name="name" data-testid="recipeName" />
          <HelpBlock>Required</HelpBlock>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Experimenter Slug</ControlLabel>
          <FormControl name="experimenter_slug" data-testid="experimentSlug" />
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
          <InputPicker
            name={"actionId"}
            placeholder={"Select an action"}
            data={actions}
            block
            value={data.action ? data.action.id : null}
            onChange={value => handleActionIDChange(value)}
          />
        </FormGroup>
        <ActionArgument
          name="arguments"
          value={JSON.stringify(data.arguments, null, 1)}
          handleChange={handleChange}
          action={data.action ? data.action.id : null}
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
  const handleArgumentChange = (editor, data, value) => {
    let newValue = {};
    try {
      newValue = JSON.parse(value);
    } catch (ex) {
      // Do nothing
    }
    props.handleChange("arguments", newValue);
  };
  if (props.action) {
    return (
      <FormGroup>
        <ControlLabel>Action Arguments</ControlLabel>
        <CodeMirrorUC
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
          onChange={handleArgumentChange}
        />
      </FormGroup>
    );
  }
  return null;
}

ActionArgument.propTypes = {
  name: PropTypes.string,
  action: PropTypes.integer,
  value: PropTypes.object,
  handleChange: PropTypes.func,
};

RecipeEditor.propTypes = {
  match: PropTypes.object,
};
