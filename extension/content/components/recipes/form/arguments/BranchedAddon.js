// @ts-nocheck

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
  Row,
  SelectPicker,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import InputField from "devtools/components/recipes/form/arguments/fields/InputField";
import ToggleField from "devtools/components/recipes/form/arguments/fields/ToggleField";

export default function BranchedAddon() {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const [extensions, setExtensions] = React.useState([]);
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  React.useEffect(() => {
    normandyApi.fetchAllExtensions().then((allExtensions) => {
      setExtensions(allExtensions);
    });
  }, [environmentKey]);

  const options = extensions.map((extension) => ({
    label: extension.name,
    value: extension.id,
  }));

  return (
    <FormGroup>
      <Row>
        <Col xs={12}>
          <InputField label="Slug" name="slug" />
          <InputField
            label="User Facing Description"
            name="userFacingDescription"
          />
        </Col>
        <Col xs={12}>
          <InputField label="User Facing Name" name="userFacingName" />
          <ToggleField label="Prevent New Enrollment" name="isEnrollmentPaused">
            Prevents new users from joining this study cohort. Exisiting users
            will remain in the study.
          </ToggleField>
        </Col>
      </Row>
      <Branches options={options} />
    </FormGroup>
  );
}

function Branches({ options }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleClickAddBranch = () => {
    /** @type {{ratio: number, slug: string, value: string | number | boolean}} */
    const newBranch = { ratio: 1, slug: "", extensionApiId: "" };

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
      <Branch key={index} index={index} options={options} />
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

function Branch({ index, options }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const branch = data.arguments.branches[index];
  const { branches } = data.arguments;

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
        <div className="pr-1">
          <FormGroup>
            <ControlLabel>Slug</ControlLabel>
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
        <div className="flex-grow-1">
          <FormGroup>
            <ControlLabel>Extension</ControlLabel>
            <SelectPicker
              block
              cleanable={false}
              data={options}
              value={branch.extensionApiId}
              onChange={handleChange("extensionApiId")}
            />
          </FormGroup>
        </div>
      </div>
    </FormGroup>
  );
}

Branch.propTypes = {
  index: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
};
Branches.propTypes = {
  options: PropTypes.array.isRequired,
};
