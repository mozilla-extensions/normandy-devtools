import React from "react";
import {
  Col,
  ControlLabel,
  FormGroup,
  InputNumber,
  Input,
  InputPicker,
  Row,
  TagPicker,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { assert } from "devtools/utils/helpers";
import {
  BucketSampleFilterObject,
  StableSampleFilterObject,
  NamespaceSampleFilterObject,
} from "types/filters";

const BUCKET_SAMPLE = "bucketSample";
const STABLE_SAMPLE = "stableSample";
const NAMESPACE_SAMPLE = "namespaceSample";

const SAMPLING_INPUT_DEFAULTS = ["normandy.recipe.id", "normandy.userId"];

const SAMPLING_OPTIONS = [
  { label: "Namespace", value: NAMESPACE_SAMPLE },
  { label: "Bucket", value: BUCKET_SAMPLE },
  { label: "Stable", value: STABLE_SAMPLE },
  { label: "None", value: null },
];

// default export
const SamplingOptions: React.FC = () => {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const filterObject = getFilterObjectFromData();
  const typeValue = filterObject ? filterObject.type : null;

  const handleTypeChange = (value): void => {
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
        // eslint-disable-next-line @typescript-eslint/camelcase
        filter_object: filterObjects,
      },
    });
  };

  const handleOptionsChange = (value: Record<string, unknown>): void => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        // eslint-disable-next-line @typescript-eslint/camelcase
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

  let optionsFields;
  switch (typeValue) {
    case BUCKET_SAMPLE: {
      optionsFields = <BucketSampleOptions onChange={handleOptionsChange} />;
      break;
    }

    case STABLE_SAMPLE: {
      optionsFields = <StableSampleOptions onChange={handleOptionsChange} />;
      break;
    }

    case NAMESPACE_SAMPLE: {
      optionsFields = <NamespaceSampleOptions onChange={handleOptionsChange} />;
      break;
    }

    case null: {
      optionsFields = null;
      break;
    }

    default: {
      throw new Error(`Unknown sampling type ${typeValue}`);
    }
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
};

export default SamplingOptions;

interface Changeable {
  onChange?: (value: unknown) => void;
}

const BucketSampleOptions: React.FC<Changeable> = ({ onChange }) => {
  const filterObject = getFilterObjectFromData();
  assert(filterObject.type === BUCKET_SAMPLE);
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
};

const StableSampleOptions: React.FC<Changeable> = ({ onChange }) => {
  const filterObject = getFilterObjectFromData();
  assert(filterObject.type === STABLE_SAMPLE);
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
};

const NamespaceSampleOptions: React.FC<Changeable> = ({ onChange }) => {
  const filterObject = getFilterObjectFromData();
  assert(filterObject.type === NAMESPACE_SAMPLE);

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
      <Col xs={4}>
        <NamespaceInput onChange={onChange} />
      </Col>
    </Row>
  );
};

interface SamplingNumberInputProps extends Changeable {
  label?: string;
  name: string;
  isPercentage?: boolean;
}

const SamplingNumberInput: React.FC<SamplingNumberInputProps> = ({
  label,
  name,
  onChange,
  isPercentage,
}) => {
  const filterObject = getFilterObjectFromData();

  let value = filterObject[name];

  if (isPercentage && value) {
    value = Math.round(value * 100);
  }

  if (!value && value !== 0) {
    value = "";
  }

  const handleChange = (value): void => {
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
        onBlur={(event): void => {
          handleChange(event.target.value);
        }}
        onChange={handleChange}
      />
    </FormGroup>
  );
};

const SamplingInputInput: React.FC<Changeable> = ({ onChange }) => {
  const filterObject = getFilterObjectFromData();
  assert(
    filterObject.type === STABLE_SAMPLE || filterObject.type === BUCKET_SAMPLE,
  );
  const inputValues = filterObject.input || [];
  const options = [...new Set([...SAMPLING_INPUT_DEFAULTS, ...inputValues])];

  const handleChange = (value): void => {
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
};

const NamespaceInput: React.FC<Changeable> = ({ onChange }) => {
  const filterObject = getFilterObjectFromData();
  assert(filterObject.type === NAMESPACE_SAMPLE);

  const value = filterObject.namespace;

  const handleChange = (newValue): void => {
    onChange({ namespace: newValue });
  };

  return (
    <FormGroup>
      <ControlLabel style={{ textTransform: "capitalize" }}>
        Namespace
      </ControlLabel>
      <Input
        value={value}
        onBlur={(event): void => {
          handleChange(event.target.value);
        }}
        onChange={handleChange}
      />
    </FormGroup>
  );
};

type SamplingFilterObject =
  | BucketSampleFilterObject
  | StableSampleFilterObject
  | NamespaceSampleFilterObject;

function getFilterObjectFromData(): SamplingFilterObject {
  const data = useRecipeDetailsData();

  let filterObject;
  if (data.filter_object) {
    filterObject = data.filter_object.find((fo) =>
      [BUCKET_SAMPLE, STABLE_SAMPLE, NAMESPACE_SAMPLE].includes(fo.type),
    );
  }

  return filterObject;
}