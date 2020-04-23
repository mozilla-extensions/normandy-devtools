import React from "react";
import PropTypes from "prop-types";
import {
  Col,
  ControlLabel,
  Divider,
  FormGroup,
  HelpBlock,
  Icon,
  IconButton,
  Input,
  InputNumber,
  Panel,
  Radio,
  RadioGroup,
  Row,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import SelectField from "devtools/components/recipes/form/arguments/fields/SelectField";
import ToggleField from "devtools/components/recipes/form/arguments/fields/ToggleField";
import InputField from "devtools/components/recipes/form/arguments/fields/InputField";

const PREFERENCE_TYPE_OPTIONS = [
  { label: "Boolean", value: "boolean" },
  { label: "Integer", value: "integer" },
  { label: "String", value: "string" },
];

const PREFERENCE_BRANCH_TYPE_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "User", value: "user" },
];

export default function PreferenceExperimentArguments() {
  const preferenceTypeChangeSideEffect = ({ data, name, value }) => {
    return {
      ...data,
      arguments: {
        ...data.arguments,
        branches: data.arguments.branches.map((b) => {
          if (name === "preferenceType") {
            if (value === "boolean") {
              return { ...b, value: false };
            }

            return { ...b, value: "" };
          }

          return b;
        }),
      },
    };
  };

  return (
    <>
      <FormGroup>
        <Row>
          <Col xs={12}>
            <InputField label="Experiment Slug" name="slug" />
          </Col>
          <Col xs={12}>
            <InputField label="Preference Name" name="preferenceName" />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xs={12}>
            <InputField
              label="Experiment Document URL"
              name="experimentDocumentUrl"
            />
          </Col>
          <Col xs={6}>
            <SelectField
              changeSideEffect={preferenceTypeChangeSideEffect}
              label="Preference Type"
              name="preferenceType"
              options={PREFERENCE_TYPE_OPTIONS}
            />
          </Col>
          <Col xs={6}>
            <SelectField
              label="Preference Branch Type"
              name="preferenceBranchType"
              options={PREFERENCE_BRANCH_TYPE_OPTIONS}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xs={12}>
            <ToggleField label="High Volume Recipe" name="isHighVolume">
              Affects the experiment type reported to telemetry, and can be used
              to filter recipe data in analysis. This should be set to true on
              recipes that affect a significant percentage of release.
            </ToggleField>
          </Col>
          <Col xs={12}>
            <ToggleField
              label="Prevent New Enrollment"
              name="isEnrollmentPaused"
            >
              Prevents new users from joining the experiment cohort.
              <br />
              Existing users will remain in the experiment.
            </ToggleField>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xs={24}>
            <Branches />
          </Col>
        </Row>
      </FormGroup>
    </>
  );
}

function Branches() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { preferenceType } = data.arguments;

  const handleClickAddBranch = () => {
    /** @type {{ratio: number, slug: string, value: string | number | boolean}} */
    const newBranch = { ratio: 1, slug: "", value: "" };
    if (preferenceType === "boolean") {
      newBranch.value = false;
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          branches: [...data.arguments.branches, newBranch],
        },
      },
    });
  };

  let branchesList = <HelpBlock>There are no branches.</HelpBlock>;
  if (data.arguments.branches && data.arguments.branches.length) {
    branchesList = data.arguments.branches.map((branch, index) => (
      <Branch key={index} index={index} />
    ));
  }

  return (
    <FormGroup>
      <ControlLabel>Branches</ControlLabel>
      <Panel bordered>
        {branchesList}
        <Divider />
        <IconButton
          icon={<Icon icon="plus-circle" />}
          onClick={handleClickAddBranch}
        >
          Add Branch
        </IconButton>
      </Panel>
    </FormGroup>
  );
}

function Branch({ index }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const branch = data.arguments.branches[index];
  const { branches, preferenceType } = data.arguments;

  const handleClickDelete = () => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          branches: branches.filter((b, i) => i !== index),
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
            branches: branches.map((b, i) => {
              if (i === index) {
                return { ...b, [name]: cb(value) };
              }

              return b;
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
    <Input value={branch.value} onChange={handleChange("value")} />
  );
  if (preferenceType === "integer") {
    valueField = (
      <InputNumber
        style={{
          width: "120px",
        }}
        value={branch.value}
        onChange={handleChange("value", parseNumericInput)}
      />
    );
  } else if (preferenceType === "boolean") {
    valueField = (
      <RadioGroup inline value={branch.value} onChange={handleChange("value")}>
        <Radio value={true}>True</Radio>
        <Radio value={false}>False</Radio>
      </RadioGroup>
    );
  }

  return (
    <FormGroup>
      <div className="d-flex">
        <div className="pr-2">
          <ControlLabel>&nbsp;</ControlLabel>
          <IconButton
            circle
            color="red"
            icon={<Icon icon="trash" />}
            size="sm"
            onClick={handleClickDelete}
          />
        </div>
        <div className="flex-grow-1 pr-1">
          <FormGroup>
            <ControlLabel>Branch Name</ControlLabel>
            <Input value={branch.slug} onChange={handleChange("slug")} />
          </FormGroup>
        </div>
        <div className="pr-1">
          <FormGroup>
            <ControlLabel>Ratio</ControlLabel>
            <InputNumber
              min={1}
              style={{
                width: "80px",
              }}
              value={branch.ratio}
              onChange={handleChange("ratio", parseNumericInput)}
            />
          </FormGroup>
        </div>
        <div className={preferenceType === "string" ? "flex-grow-1" : ""}>
          <FormGroup>
            <ControlLabel>Value</ControlLabel>
            {valueField}
          </FormGroup>
        </div>
      </div>
    </FormGroup>
  );
}

Branch.propTypes = {
  index: PropTypes.number.isRequired,
};
