import React from "react";
import PropTypes from "prop-types";
import {
  InputPicker,
  InputNumber,
  FormGroup,
  ControlLabel,
  Row,
  Col,
  TagPicker,
} from "rsuite";

const options = [
  { label: "Bucket", value: "bucketSample" },
  { label: "Stable", value: "stableSample" },
  { label: "None", value: null },
];
export default function SamplingOptions(props) {
  const { filterValues, handleTypeChange, handleFieldChange } = props;
  const getSelectedOption = () => {
    if (filterValues.stableSample) {
      return "stableSample";
    }
    if (filterValues.bucketSample) {
      return "bucketSample";
    }
    return null;
  };

  const SampleMethodOptions = () => {
    if (filterValues && filterValues.stableSample) {
      return (
        <StableSampleOptions
          handleChange={handleFieldChange}
          filterValues={filterValues.stableSample}
        />
      );
    }
    if (filterValues && filterValues.bucketSample) {
      return (
        <BucketSampleOptions
          handleChange={handleFieldChange}
          filterValues={filterValues.bucketSample}
        />
      );
    }
    return null;
  };

  return (
    <FormGroup>
      <ControlLabel>Sampling Type</ControlLabel>
      <InputPicker
        data={options}
        onChange={(value, _) => handleTypeChange(value)}
        value={getSelectedOption()}
      />
      <SampleMethodOptions filterValues={filterValues} />
    </FormGroup>
  );
}

const StableSampleOptions = (props) => {
  const { handleChange, filterValues } = props;

  return (
    <Row>
      <Col xs={12}>
        <FormGroup>
          <ControlLabel>Rate</ControlLabel>
          <InputNumber
            onBlur={(event) => {
              handleChange("stableSample", "rate", event.target.value / 100);
            }}
            onChange={(value, event) =>
              event.target.click
                ? handleChange("stableSample", "rate", value)
                : null
            }
            defaultValue={filterValues.rate ? filterValues.rate * 100 : null}
            postfix={"%"}
          />
        </FormGroup>
      </Col>
      <Col xs={12}>
        <SamplingInput
          handleChange={handleChange}
          inputValues={filterValues.input}
          sampleType="stableSample"
        />
      </Col>
    </Row>
  );
};

const BucketSampleOptions = (props) => {
  const { handleChange, filterValues } = props;

  return (
    <Row>
      <BucketSamplingNumberPicker
        sampleField="start"
        filterValues={filterValues}
        handleChange={handleChange}
      />
      <BucketSamplingNumberPicker
        sampleField="count"
        filterValues={filterValues}
        handleChange={handleChange}
      />
      <BucketSamplingNumberPicker
        sampleField="total"
        filterValues={filterValues}
        handleChange={handleChange}
      />
      <Col xs={8}>
        <SamplingInput
          handleChange={handleChange}
          inputValues={filterValues.input}
          sampleType="bucketSample"
        />
      </Col>
    </Row>
  );
};

const BucketSamplingNumberPicker = (props) => {
  const { sampleField, filterValues, handleChange } = props;
  return (
    <Col xs={4}>
      <FormGroup>
        <ControlLabel style={{ textTransform: "capitalize" }}>
          {sampleField}
        </ControlLabel>
        <InputNumber
          onBlur={(event) =>
            handleChange("bucketSample", sampleField, event.target.value)
          }
          onChange={(value, event) =>
            event.target.click
              ? handleChange("bucketSample", sampleField, value)
              : null
          }
          defaultValue={filterValues ? filterValues[sampleField] : null}
        />
      </FormGroup>
    </Col>
  );
};

const SamplingInput = (props) => {
  const { handleChange, inputValues, sampleType } = props;
  const defaultInputs = ["normandy.recipe.id", "normandy.user.id"];
  const currentInputs = inputValues ? inputValues : [];
  const totalInputs = [...new Set([...currentInputs, ...defaultInputs])];
  const inputOptions = totalInputs.map((entry) => {
    return { label: entry, value: entry };
  });
  return (
    <FormGroup>
      <ControlLabel>Input</ControlLabel>
      <TagPicker
        data={inputOptions}
        value={currentInputs}
        onChange={(value) => handleChange(sampleType, "input", value)}
        creatable
        block
      />
    </FormGroup>
  );
};
BucketSamplingNumberPicker.propTypes = {
  sampleField: PropTypes.string,
  filterValues: PropTypes.object,
  handleChange: PropTypes.func,
};

SamplingOptions.propTypes = {
  filterValues: PropTypes.object,
  handleTypeChange: PropTypes.func,
  handleFieldChange: PropTypes.func,
};

SamplingInput.propTypes = {
  handleChange: PropTypes.func,
  inputValues: PropTypes.array,
  sampleType: PropTypes.string,
};

BucketSampleOptions.propTypes = {
  handleChange: PropTypes.func,
  filterValues: PropTypes.object,
};

StableSampleOptions.propTypes = {
  handleChange: PropTypes.func,
  filterValues: PropTypes.object,
};
