import React from "react";
import PropTypes from "prop-types";
import {
  ControlLabel,
  Divider,
  FormGroup,
  HelpBlock,
  Icon,
  IconButton,
  Input,
  InputNumber,
  InputPicker,
  Panel,
  Radio,
  RadioGroup,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import InputField from "devtools/components/recipes/form/arguments/fields/InputField";

const PREFERENCE_TYPE_OPTIONS = [
  { label: "Boolean", value: "boolean" },
  { label: "Integer", value: "number" },
  { label: "String", value: "string" },
];

export default function PreferenceRollout() {
  return (
    <FormGroup>
      <InputField label="Slug" name="slug" />
      <Preferences />
    </FormGroup>
  );
}

function Preferences() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const handleClickAddPreference = () => {
    const newPref = { preferenceName: "", value: "" };

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          preferences: [...data.arguments.preferences, newPref],
        },
      },
    });
  };

  let prefList = <HelpBlock>There are no preferences.</HelpBlock>;
  if (data.arguments.preferences && data.arguments.preferences.length) {
    prefList = data.arguments.preferences.map((_, index) => (
      <Preference key={index} index={index} />
    ));
  }

  return (
    <FormGroup>
      <ControlLabel>Preferences</ControlLabel>
      <Panel bordered>
        {prefList}
        <Divider />
        <IconButton
          icon={<Icon icon="plus-circle" />}
          onClick={handleClickAddPreference}
        >
          Add Preference
        </IconButton>
      </Panel>
    </FormGroup>
  );
}

function Preference({ index }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const preference = data.arguments.preferences[index];
  const { preferences } = data.arguments;
  const [preferenceType, setPreferenceType] = React.useState(
    typeof preference.value,
  );
  const handleClickDelete = () => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          preferences: preferences.filter((_, i) => i !== index),
        },
      },
    });
  };

  const handleChange = (name, cb = (v) => v) => {
    return (value) => {
      dispatch({
        type: ACTION_UPDATE_DATA,
        data: {
          ...data,
          arguments: {
            ...data.arguments,
            preferences: preferences.map((p, i) => {
              if (i === index) {
                return { ...p, [name]: cb(value) };
              }

              return p;
            }),
          },
        },
      });
    };
  };

  const parseNumericInput = (value) => {
    if (!value) {
      return "";
    }

    return parseInt(value, 10);
  };

  let valueField = (
    <Input block value={preference.value} onChange={handleChange("value")} />
  );

  if (preferenceType === "number") {
    valueField = (
      <InputNumber
        block
        value={preference.value}
        onChange={handleChange("value", parseNumericInput)}
      />
    );
  } else if (preferenceType === "boolean") {
    valueField = (
      <RadioGroup
        inline
        value={preference.value}
        onChange={handleChange("value")}
      >
        <Radio value={true}>True</Radio>
        <Radio value={false}>False</Radio>
      </RadioGroup>
    );
  }

  return (
    <FormGroup>
      <div className="d-flex">
        <div className="pr-2">
          <FormGroup>
            <ControlLabel>&nbsp;</ControlLabel>
            <IconButton
              circle
              color="red"
              icon={<Icon icon="trash" />}
              size="sm"
              onClick={handleClickDelete}
            />
          </FormGroup>
        </div>

        <div className="pr-1">
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <Input
              style={{
                width: "400px",
              }}
              value={preference.preferenceName}
              onChange={handleChange("preferenceName")}
            />
          </FormGroup>
        </div>
        <div className="pr-1">
          <FormGroup>
            <ControlLabel>Preference Type</ControlLabel>
            <InputPicker
              data={PREFERENCE_TYPE_OPTIONS}
              value={preferenceType}
              onChange={(value, _) => {
                setPreferenceType(value);
                preference.value = "";
              }}
            />
          </FormGroup>
        </div>
        <div>
          <FormGroup>
            <ControlLabel>Value</ControlLabel>
            {valueField}
          </FormGroup>
        </div>
      </div>
    </FormGroup>
  );
}

Preference.propTypes = {
  index: PropTypes.number.isRequired,
};
