import PropTypes from "prop-types";
import React from "react";
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

import PreferenceFields from "devtools/components/recipes/form/arguments/PreferenceFields";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

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
  const branchLength = data.arguments.branches.length;
  if (data.arguments.branches && data.arguments.branches.length) {
    branchesList = data.arguments.branches.map((branch, index) => {
      return <Branch key={`${index}${branchLength}`} index={index} />;
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

function Branch({ index }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { branches } = data.arguments;
  const branch = branches[index];
  const [preferences, setPreferences] = React.useState([]);

  React.useEffect(() => {
    if (branch.preferences) {
      const all_preferences = Object.keys(branch.preferences).map((pref) => {
        return { ...branch.preferences[pref], preferenceName: pref };
      });
      setPreferences(all_preferences);
    }
  }, [branch.preferences]);

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
      const { [name]: _omitPref, ...cleanedPref } = branch.preferences;
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

    const {
      [preferenceName]: _omitPrefValue,
      ...cleanedPref
    } = branch.preferences;

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
    const { [oldPrefName]: _omitPrefName, ...cleanedPref } = branch.preferences;
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

  const handleChange = (name, transform = (v) => v) => {
    return (value) => {
      dispatch({
        type: ACTION_UPDATE_DATA,
        data: {
          ...data,
          arguments: {
            ...data.arguments,
            branches: branches.map((b, i) => {
              if (i === index) {
                return { ...b, [name]: transform(value) };
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
    prefList = (
      <>
        {preferences.map((pref, i) => {
          return (
            <PreferenceFields
              key={`${branch.slug}:${i}`}
              index={i}
              prefData={pref}
              onChange={handlePrefChange}
              onDelete={handleDeletePref}
            />
          );
        })}
      </>
    );
  }

  const parseNumericInput = (value) => {
    if (!value) {
      return "";
    }

    return parseInt(value, 10);
  };

  return (
    <FormGroup>
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
      </FormGroup>

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
