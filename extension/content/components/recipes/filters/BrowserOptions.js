import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  InputNumber,
  FormGroup,
  ControlLabel,
  Checkbox,
  CheckboxGroup,
  Row,
  Col,
  Tag,
  TagGroup,
} from "rsuite";

const MIN_VERSION = 40;
export const BrowserOptions = (props) => {
  const { channelFO, versionFO, handleFOChange } = props;
  let versionInput;

  return (
    <Row>
      <Col xs={12}>
        <FormGroup>
          <ControlLabel>Channel</ControlLabel>
          <CheckboxGroup
            inline
            name="checkboxList"
            value={channelFO ? channelFO.channels : []}
            onChange={(value) => handleFOChange("channel", value)}
          >
            <Checkbox value="beta">Beta</Checkbox>
            <Checkbox value="aurora">Developer Edition</Checkbox>
            <Checkbox value="nightly">Nightly</Checkbox>
            <Checkbox value="release">Release</Checkbox>
          </CheckboxGroup>
        </FormGroup>
      </Col>
      <Col xs={12}>
        <Row>
          <ControlLabel>Version</ControlLabel>
          <Col xs={12}>
            <InputNumber
              min={MIN_VERSION}
              onChange={(value) => (versionInput = value)}
            />
            <TagGroup>
              {versionFO
                ? versionFO.versions.map((version) => {
                    return (
                      <Tag
                        key={version}
                        closable
                        onClose={() =>
                          handleDeleteVersion(
                            version,
                            versionFO,
                            handleFOChange,
                          )
                        }
                      >
                        {version}
                      </Tag>
                    );
                  })
                : null}
            </TagGroup>
          </Col>
          <Col xs={12}>
            <Button
              onClick={() => {
                handleAddVersion(versionInput, versionFO, handleFOChange);
              }}
            >
              Add
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

const handleAddVersion = (version, versionFO, handleFOChange) => {
  if (versionFO) {
    handleFOChange("version", [...versionFO.versions, version]);
  } else {
    handleFOChange("version", [version]);
  }
};

const handleDeleteVersion = (version, versionFO, handleFOChange) => {
  const changedVersions = versionFO.versions.filter((entry) => {
    return version !== entry;
  });

  handleFOChange("version", changedVersions);
};

BrowserOptions.propTypes = {
  channelFO: PropTypes.object,
  versionFO: PropTypes.object,
  handleFOChange: PropTypes.func,
};
