import React from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Col,
  ControlLabel,
  FormGroup,
  InputNumber,
  Row,
  Tag,
  TagGroup,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

const MIN_VERSION = 40;

export default function BrowserOptions() {
  return (
    <Row>
      <Col xs={12}>
        <ChannelFilter />
      </Col>
      <Col xs={12}>
        <Row>
          <VersionFilter />
        </Row>
      </Col>
    </Row>
  );
}

function ChannelFilter() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  let filterObject;
  if (data.filter_object) {
    filterObject = data.filter_object.find((fo) => fo.type === "channel");
  }

  const value =
    filterObject && filterObject.channels ? filterObject.channels : [];

  const handleChange = (value) => {
    const newFilterObjects = [
      ...data.filter_object.filter((fo) => fo !== filterObject),
    ];

    if (value.length) {
      newFilterObjects.push({
        type: "channel",
        channels: value,
      });
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: newFilterObjects,
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Channel</ControlLabel>
      <CheckboxGroup
        inline
        name="checkboxList"
        value={value}
        onChange={handleChange}
      >
        <Checkbox value="beta">Beta</Checkbox>
        <Checkbox value="aurora">Developer Edition</Checkbox>
        <Checkbox value="nightly">Nightly</Checkbox>
        <Checkbox value="release">Release</Checkbox>
      </CheckboxGroup>
    </FormGroup>
  );
}

function VersionFilter() {
  const [versionNumber, setVersionNumber] = React.useState();
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  let filterObject;
  if (data.filter_object) {
    filterObject = data.filter_object.find((fo) => fo.type === "version");
  }

  const versions =
    filterObject && filterObject.versions ? filterObject.versions : [];

  const handleAdd = () => {
    const newVersions = new Set([...versions, parseInt(versionNumber, 10)]);

    const newFilterObjects = [
      ...data.filter_object.filter((fo) => fo !== filterObject),
    ];

    if (newVersions.size) {
      newFilterObjects.push({
        type: "version",
        versions: [...newVersions],
      });
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: newFilterObjects,
      },
    });
  };

  const handleDelete = (version) => {
    const newVersions = versions.filter((v) => v !== version);

    const newFilterObjects = [
      ...data.filter_object.filter((fo) => fo !== filterObject),
    ];

    if (newVersions.length) {
      newFilterObjects.push({
        type: "version",
        versions: [...newVersions],
      });
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: newFilterObjects,
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Version</ControlLabel>
      <Col xs={12}>
        <InputNumber
          min={MIN_VERSION}
          value={versionNumber}
          // @ts-ignore
          onChange={setVersionNumber}
        />
        <TagGroup>
          {versions.sort().map((version) => (
            <Tag
              key={version}
              closable
              onClose={() => {
                handleDelete(version);
              }}
            >
              {version}
            </Tag>
          ))}
        </TagGroup>
      </Col>
      <Col xs={12}>
        <Button disabled={!versionNumber} onClick={handleAdd}>
          Add
        </Button>
      </Col>
    </FormGroup>
  );
}
