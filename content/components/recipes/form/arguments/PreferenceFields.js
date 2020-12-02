import PropTypes from "prop-types";
import React from "react";
import {
  ControlLabel,
  FormGroup,
  Icon,
  IconButton,
  Input,
  InputPicker,
  InputNumber,
  Radio,
  RadioGroup,
} from "rsuite";

import ServerErrors from "devtools/components/recipes/form/ServerErrors";

const PREFERENCE_TYPE_OPTIONS = [
  { label: "Boolean", value: "boolean" },
  { label: "Integer", value: "integer" },
  { label: "String", value: "string" },
];

const PREFERENCE_BRANCH_TYPE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "User", value: "user" },
];

export default function PreferenceFields({
  index,
  prefData,
  onChange,
  onDelete,
}) {
  const {
    preferenceName,
    preferenceBranchType,
    preferenceType,
    preferenceValue,
  } = prefData;

  const handleChange = (name, cb = (v) => v) => {
    return (value) => {
      onChange(index, name, cb(value));
    };
  };

  const parseNumericInput = (value) => {
    if (!value) {
      return "";
    }

    return parseInt(value, 10);
  };

  let valueField = (
    <Input
      block
      value={preferenceValue}
      onChange={handleChange("preferenceValue")}
    />
  );

  if (preferenceType === "integer") {
    valueField = (
      <InputNumber
        block
        value={preferenceValue}
        onChange={handleChange("preferenceValue", parseNumericInput)}
      />
    );
  } else if (preferenceType === "boolean") {
    valueField = (
      <RadioGroup
        inline
        value={preferenceValue}
        onChange={handleChange("preferenceValue")}
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
              onClick={() => onDelete(index, preferenceName)}
            />
          </FormGroup>
        </div>

        <div className="pr-1 w-400px">
          <FormGroup>
            <ControlLabel>Name</ControlLabel>
            <Input
              value={preferenceName}
              onChange={handleChange("preferenceName")}
            />
            <ServerErrors field={`arguments.preferences.${index}.name`} />
          </FormGroup>
        </div>
        <div className="pr-1">
          <FormGroup>
            <ControlLabel>Preference Branch Type</ControlLabel>
            <InputPicker
              cleanable={false}
              data={PREFERENCE_BRANCH_TYPE_OPTIONS}
              value={preferenceBranchType}
              onChange={handleChange("preferenceBranchType")}
            />
          </FormGroup>
        </div>
        <div className="pr-1">
          <FormGroup>
            <ControlLabel>Preference Type</ControlLabel>
            <InputPicker
              cleanable={false}
              data={PREFERENCE_TYPE_OPTIONS}
              value={preferenceType}
              onChange={handleChange("preferenceType")}
            />
          </FormGroup>
        </div>
        <div className="flex-grow-1">
          <FormGroup>
            <ControlLabel>Value</ControlLabel>
            {valueField}
            <ServerErrors field={`arguments.preferences.${index}.value`} />
          </FormGroup>
        </div>
      </div>
    </FormGroup>
  );
}

PreferenceFields.propTypes = {
  index: PropTypes.number,
  prefData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
