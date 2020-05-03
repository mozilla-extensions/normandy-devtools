import React from "react";
import PropTypes from "prop-types";

import {
  Col,
  ControlLabel,
  FormGroup,
  InputNumber,
  InputPicker,
  Row,
  TagPicker,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

const BUCKET_SAMPLE = "bucketSample";
const STABLE_SAMPLE = "stableSample";

const SAMPLING_INPUT_DEFAULTS = ["normandy.recipe.id", "normandy.userId"];

const SAMPLING_OPTIONS = [
  { label: "Bucket", value: "bucketSample" },
  { label: "Stable", value: "stableSample" },
  { label: "None", value: null },
];

export default function SamplingOptions() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const filterObject = getFilterObjectFromData();
  const typeValue = filterObject ? filterObject.type : null;

  const handleTypeChange = (value) => {
    const filterObjects = [
      ...data.filter_object.filter((fo) => fo !== filterObject),
    ];

    if (value) {
      filterObjects.push({
        type: value,
      });
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: filterObjects,
      },
    });
  };

  const handleOptionsChange = (value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: [
          ...data.filter_object.filter((fo) => fo !== filterObject),
          {
            ...filterObject,
            ...value,
          },
        ],
      },
    });
  };

  let optionsFields = null;
  if (typeValue === BUCKET_SAMPLE) {
    optionsFields = <BucketSampleOptions onChange={handleOptionsChange} />;
  } else if (typeValue === STABLE_SAMPLE) {
    optionsFields = <StableSampleOptions onChange={handleOptionsChange} />;
  }

  return (
    <>
      <FormGroup>
        <ControlLabel>Sampling Type</ControlLabel>
        <InputPicker
          cleanable={false}
          data={SAMPLING_OPTIONS}
          value={typeValue}
          onChange={handleTypeChange}
        />
      </FormGroup>
      {optionsFields}
    </>
  );
}

function BucketSampleOptions({ onChange }) {
  const filterObject = getFilterObjectFromData();
  const input = filterObject.input || [];

  return (
    <Row>
      <Col xs={4}>
        <SamplingNumberInput label="Start" name="start" onChange={onChange} />
      </Col>
      <Col xs={4}>
        <SamplingNumberInput label="Count" name="count" onChange={onChange} />
      </Col>
      <Col xs={4}>
        <SamplingNumberInput label="Total" name="total" onChange={onChange} />
      </Col>
      <Col xs={12}>
        <SamplingInputInput key={JSON.stringify(input)} onChange={onChange} />
      </Col>
    </Row>
  );
}

BucketSampleOptions.propTypes = {
  onChange: PropTypes.func,
};

function StableSampleOptions({ onChange }) {
  const filterObject = getFilterObjectFromData();
  const input = filterObject.input || [];

  return (
    <Row>
      <Col xs={12}>
        <SamplingNumberInput
          isPercentage
          label="Rate"
          name="rate"
          onChange={onChange}
        />
      </Col>
      <Col xs={12}>
        <SamplingInputInput key={JSON.stringify(input)} onChange={onChange} />
      </Col>
    </Row>
  );
}

StableSampleOptions.propTypes = {
  onChange: PropTypes.func,
};

function SamplingNumberInput({ label, name, onChange, isPercentage }) {
  const filterObject = getFilterObjectFromData();

  let value = filterObject[name];

  if (isPercentage && value) {
    value = Math.round(value * 100);
  }

  if (!value && value !== 0) {
    value = "";
  }

  const handleChange = (value) => {
    let newValue;
    if (isPercentage) {
      newValue = parseInt(value, 10) || 0;
      onChange({
        [name]: newValue / 100,
      });
    } else {
      newValue = parseInt(value, 10);
      onChange({
        [name]: newValue || newValue === 0 ? newValue : undefined,
      });
    }
  };

  return (
    <FormGroup>
      <ControlLabel style={{ textTransform: "capitalize" }}>
        {label}
      </ControlLabel>
      <InputNumber
        min={0}
        postfix={isPercentage ? "%" : undefined}
        value={value}
        onBlur={(event) => {
          handleChange(event.target.value);
        }}
        onChange={handleChange}
      />
    </FormGroup>
  );
}

SamplingNumberInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  isPercentage: PropTypes.bool,
};

function SamplingInputInput({ onChange }) {
  const filterObject = getFilterObjectFromData();
  const inputValues = filterObject.input || [];
  const options = [...new Set([...SAMPLING_INPUT_DEFAULTS, ...inputValues])];

  const handleChange = (value) => {
    if (!value) {
      onChange({
        input: [],
      });
    }

    const processedValues = value.map((v) => {
      if (options.includes(v)) {
        return v;
      }

      return `"${v}"`;
    });
    onChange({
      input: [...new Set(processedValues)],
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Input</ControlLabel>
      <TagPicker
        block
        creatable
        data={options.map((v) => ({
          label: v,
          value: v,
        }))}
        placement="bottomStart"
        value={inputValues}
        onChange={handleChange}
      />
    </FormGroup>
  );
}

SamplingInputInput.propTypes = {
  onChange: PropTypes.func,
};

function getFilterObjectFromData() {
  const data = useRecipeDetailsData();

  let filterObject;
  if (data.filter_object) {
    filterObject = data.filter_object.find((fo) =>
      [BUCKET_SAMPLE, STABLE_SAMPLE].includes(fo.type),
    );
  }

  return filterObject;
}
