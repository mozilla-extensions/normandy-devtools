import React from "react";
import PropTypes from "prop-types";
import { Divider, FormGroup, ControlLabel, Panel } from "rsuite";
import { BrowserOptions } from "devtools/components/recipes/filters/BrowserOptions";
import { GeoOptions } from "devtools/components/recipes/filters/GeoOptions";
import SamplingOptions from "devtools/components/recipes/filters/SamplingOptions";

export default function FilterObjects(props) {
  const { filterObjectData, countryOptions, localeOptions } = props;
  const filterValues = filterObjectData.reduce(
    (obj, item) => Object.assign(obj, { [item.type]: item }),
    {},
  );

  const handleFOChange = (key, value) => {
    const pluralMapping = {
      country: "countries",
      locale: "locales",
      channel: "channels",
      version: "versions",
    };
    const changedFilterValues = filterObjectData.filter((entry) => {
      return entry.type !== key;
    });
    const pluralKey = pluralMapping[key];

    changedFilterValues.push({ type: key, [pluralKey]: value });

    props.handleChange("filter_object", changedFilterValues);
  };

  const handleSamplingTypeChange = (type) => {
    const changedFilterValues = filterObjectData.filter((entry) => {
      return !entry.type.includes("Sample");
    });
    if (type !== null) {
      props.handleChange("filter_object", [...changedFilterValues, { type }]);
    } else {
      props.handleChange("filter_object", [...changedFilterValues]);
    }
  };

  const handleSamplingFieldChange = (type, key, value) => {
    const changedFilterValues = filterObjectData.filter((entry) => {
      return !entry.type.includes("Sample");
    });
    props.handleChange("filter_object", [
      ...changedFilterValues,
      { ...filterValues[type], [key]: value },
    ]);
  };

  return (
    <FormGroup>
      <ControlLabel>Filter Objects</ControlLabel>

      <Panel bordered>
        <SamplingOptions
          filterValues={filterValues}
          handleFieldChange={handleSamplingFieldChange}
          handleTypeChange={handleSamplingTypeChange}
        />
        <Divider />
        <BrowserOptions
          channelFO={filterValues.channel}
          handleFOChange={handleFOChange}
          versionFO={filterValues.version}
        />
        <Divider />
        <GeoOptions
          countries={countryOptions}
          countryFO={filterValues.country}
          filterValues={filterValues}
          handleFOChange={handleFOChange}
          localeFO={filterValues.locale}
          locales={localeOptions}
        />
      </Panel>
    </FormGroup>
  );
}

FilterObjects.propTypes = {
  filterObjectData: PropTypes.array,
  handleChange: PropTypes.func,
  countryOptions: PropTypes.array,
  localeOptions: PropTypes.array,
};
