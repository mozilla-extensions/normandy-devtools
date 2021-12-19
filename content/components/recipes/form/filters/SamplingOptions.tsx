import React, { useContext } from "react";
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

import { layoutContext } from "devtools/contexts/layout";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import {
  BucketSampleFilterObject,
  StableSampleFilterObject,
  NamespaceSampleFilterObject,
} from "devtools/types/filters";
import { assert } from "devtools/utils/helpers";

const BUCKET_SAMPLE = "bucketSample";
const STABLE_SAMPLE = "stableSample";
const NAMESPACE_SAMPLE = "namespaceSample";

const SAMPLING_INPUT_DEFAULTS = ["normandy.userId", '"global-v4"'];

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
  const { container } = useContext(layoutContext);

  const filterObject = getFilterObjectFromData();
  const typeValue = filterObject ? filterObject.type : null;

  const handleTypeChange = (value): void => {
    const oldFilterObject = filterObject;
    const filterObjects = [
      ...data.filter_object.filter((fo) => fo !== oldFilterObject),
    ];

    if (value) {
      filterObjects.push(convertBetweenSamplingTypes(oldFilterObject, value));
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: filterObjects,
      },
    });
  };

  const handleOptionsChange = (value: Record<string, unknown>): void => {
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
          container={container}
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
  const { container } = useContext(layoutContext);
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
        container={container}
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

export function convertBetweenSamplingTypes(
  oldFilter: null | Partial<SamplingFilterObject>,
  newType: SamplingFilterObject["type"],
): Partial<SamplingFilterObject> {
  let newFilter: Partial<SamplingFilterObject> = { type: newType };
  if (!oldFilter?.type) {
    return newFilter;
  }

  switch (`${oldFilter.type} -> ${newType}`) {
    case "bucketSample -> namespaceSample": {
      oldFilter = oldFilter as Partial<BucketSampleFilterObject>;
      newFilter = newFilter as Partial<NamespaceSampleFilterObject>;

      if (oldFilter.input?.length === 2) {
        newFilter.namespace = oldFilter.input
          .find((i) => i !== "normandy.userId")
          ?.replace(/^["']|["']$/g, ""); // replace a leading and trailing quote
      }

      newFilter.start = oldFilter.start;
      if (oldFilter.total === 10_000) {
        newFilter.count = oldFilter.count;
      }

      break;
    }

    case "namespaceSample -> bucketSample": {
      oldFilter = oldFilter as Partial<NamespaceSampleFilterObject>;
      newFilter = newFilter as Partial<BucketSampleFilterObject>;

      newFilter.input = ["normandy.userId"];
      if (oldFilter.namespace) {
        newFilter.input.push(`"${oldFilter.namespace}"`);
      }

      newFilter.start = oldFilter.start;
      newFilter.count = oldFilter.count;
      newFilter.total = 10_000;
    }

    // More conversions could be added here, if we want.
  }

  return newFilter;
}
