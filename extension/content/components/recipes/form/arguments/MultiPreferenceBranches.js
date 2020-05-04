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
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import PreferenceFields from "devtools/components/recipes/form/arguments/PreferenceFields";

export default function MultiPreferenceBranches() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleClickAddBranch = () => {
    /** @type {{ratio: number, slug: string, preferences: object}} */
    const newBranch = { ratio: 1, slug: "", preferences: {} };

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
    branchesList = data.arguments.branches.map((branch, index) => {
      return <Branch key={index} branch={branch} index={index} />;
    });
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

function Branch({ branch, index }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { branches } = data.arguments;
  const [preferences, setPreferences] = React.useState([]);

  React.useEffect(() => {
    if (branch.preferences) {
      const all_preferences = Object.keys(branch.preferences).map((pref) => {
        return { ...branch.preferences[pref], preferenceName: pref };
      });
      setPreferences(all_preferences);
    }
  }, []);

  const handleClickAddPref = () => {
    const newPref = {
      preferenceName: "",
      preferenceValue: "",
      preferenceBranchType: "",
      preferenceType: "",
    };
    setPreferences([...preferences, newPref]);
  };

  const handleDeletePref = (prefIndex, name) => {
    if (name) {
      /* eslint-disable no-unused-vars */
      const { [name]: _omitPref, ...cleanedPref } = branch.preferences;
      /* eslint-enable no-unused-vars */

      handlePrefDataUpdate(cleanedPref);
    }

    setPreferences(preferences.filter((p, i) => i !== prefIndex));
  };

  const handlePrefChange = (prefIndex, name, value) => {
    if (name === "preferenceName") {
      handlePrefNameChange(prefIndex, value);
    } else {
      handlePrefFieldChange(prefIndex, name, value);
    }
  };

  const handlePrefFieldChange = (prefIndex, prefFieldName, prefValue) => {
    const preference = preferences[prefIndex];
    const { preferenceName, ...prefValues } = preference;
    let updatedPref;
    if (prefFieldName === "preferenceType") {
      updatedPref = {
        ...prefValues,
        [prefFieldName]: prefValue,
        preferenceValue: "",
      };
    } else {
      updatedPref = { ...prefValues, [prefFieldName]: prefValue };
    }

    /* eslint-disable no-unused-vars */
    const {
      [preferenceName]: _omitPrefValue,
      ...cleanedPref
    } = branch.preferences;
    /* eslint-enable no-unused-vars */

    const updatedPreferences = {
      ...cleanedPref,
      [preferenceName]: updatedPref,
    };
    handlePrefDataUpdate(updatedPreferences);

    preferences[prefIndex] = { preferenceName, ...updatedPref };
    setPreferences(preferences);
  };

  const handlePrefNameChange = (prefIndex, newPrefName) => {
    const preference = preferences[prefIndex];
    const { preferenceName: oldPrefName, ...prefValues } = preference;
    /* eslint-disable no-unused-vars */
    const { [oldPrefName]: _omitPrefName, ...cleanedPref } = branch.preferences;
    /* eslint-enable no-unused-vars */
    const updatedPref = { ...cleanedPref, [newPrefName]: prefValues };
    handlePrefDataUpdate(updatedPref);
    preference.preferenceName = newPrefName;
    setPreferences(preferences);
  };

  const handlePrefDataUpdate = (updatedPref) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          branches: branches.map((b, i) => {
            if (i === index) {
              return {
                ...b,
                preferences: updatedPref,
              };
            }

            return b;
          }),
        },
      },
    });
  };

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

  const handleChange = (name) => {
    return (value) => {
      dispatch({
        type: ACTION_UPDATE_DATA,
        data: {
          ...data,
          arguments: {
            ...data.arguments,
            branches: branches.map((b, i) => {
              if (i === index) {
                return { ...b, [name]: value };
              }

              return b;
            }),
          },
        },
      });
    };
  };

  let prefList = <HelpBlock>There are no preferences.</HelpBlock>;
  if (branch && branch.preferences) {
    prefList = preferences.map((pref, i) => {
      return (
        <PreferenceFields
          key={`${branch.slug}:${i}`}
          index={i}
          prefData={pref}
          onChange={handlePrefChange}
          onDelete={handleDeletePref}
        />
      );
    });
  }

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
      </div>
      <Col xsOffset={1}>
        <FormGroup>
          <ControlLabel>Preferences</ControlLabel>
          <Panel bordered>
            {prefList}
            <Divider />
            <IconButton
              icon={<Icon icon="plus-circle" />}
              onClick={handleClickAddPref}
            >
              Add Preference
            </IconButton>
          </Panel>
        </FormGroup>
      </Col>
    </FormGroup>
  );
}

Branch.propTypes = {
  index: PropTypes.number,
};
