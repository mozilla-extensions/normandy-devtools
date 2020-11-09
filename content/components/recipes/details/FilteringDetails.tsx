import React from "react";
import { ButtonGroup, Icon, IconButton } from "rsuite";

import CollapsibleSection, {
  HeaderButtonPopover,
} from "devtools/components/common/CollapsibleSection";
import Highlight from "devtools/components/common/Highlight";
import BucketSample from "devtools/components/recipes/details/filters/BucketSample";
import Channel from "devtools/components/recipes/details/filters/Channel";
import Country from "devtools/components/recipes/details/filters/Country";
import Locale from "devtools/components/recipes/details/filters/Locale";
import NamespaceSample from "devtools/components/recipes/details/filters/NamespaceSample";
import StableSample from "devtools/components/recipes/details/filters/StableSample";
import Version from "devtools/components/recipes/details/filters/Version";
import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import { splitCamelCase } from "devtools/utils/helpers";

const MODE_RICH = "RICH";
const MODE_RAW = "RAW";
const MODE_COMPOSITE = "COMPOSITE";

const FILTER_OBJECT_MAPPING = {
  bucketSample: BucketSample,
  channel: Channel,
  country: Country,
  locale: Locale,
  stableSample: StableSample,
  version: Version,
  namespaceSample: NamespaceSample,
};

const FilteringDetails: React.FC = () => {
  const data = useRecipeDetailsData();
  const [mode, setMode] = React.useState(MODE_RICH);

  const generateHandlerModeClick = (newMode) => {
    return () => {
      setMode(newMode);
    };
  };

  let details = null;
  if (mode === MODE_RAW) {
    details = <RawDetails />;
  } else if (mode === MODE_RICH) {
    details = <RichDetails />;
  }

  let filterExpression = (
    <div className="mt-4">
      <strong>Extra Filter Expression</strong>
      <div className="my-1 text-subtle">
        <code>
          <em>(no extra filter expression set)</em>
        </code>
      </div>
    </div>
  );
  if (mode === MODE_COMPOSITE) {
    filterExpression = (
      <div className="mt-4">
        <strong>Filter Expression</strong>
        <Highlight className="javascript">{data.filter_expression}</Highlight>
      </div>
    );
  } else if (data.extra_filter_expression) {
    filterExpression = (
      <div className="mt-4">
        <strong>Extra Filter Expression</strong>
        <Highlight className="javascript">
          {data.extra_filter_expression}
        </Highlight>
      </div>
    );
  }

  return (
    <CollapsibleSection
      headerButtons={
        <ButtonGroup>
          <HeaderButtonPopover message="Display the rich details">
            <IconButton
              active={mode === MODE_RICH}
              icon={<Icon icon="file-text-o" />}
              onClick={generateHandlerModeClick(MODE_RICH)}
            />
          </HeaderButtonPopover>
          <HeaderButtonPopover message="Display the composite details">
            <IconButton
              active={mode === MODE_COMPOSITE}
              icon={<Icon icon="cubes" />}
              onClick={generateHandlerModeClick(MODE_COMPOSITE)}
            />
          </HeaderButtonPopover>
          <HeaderButtonPopover message="Display the raw details">
            <IconButton
              active={mode === MODE_RAW}
              icon={<Icon icon="code" />}
              onClick={generateHandlerModeClick(MODE_RAW)}
            />
          </HeaderButtonPopover>
        </ButtonGroup>
      }
      title={<h6 className="flex-grow-1">Filtering</h6>}
    >
      <div className="py-1 pl-4">
        {filterExpression}
        {details}
      </div>
    </CollapsibleSection>
  );
};

const RawDetails: React.FC = () => {
  const data = useRecipeDetailsData();

  return (
    <div className="mt-4">
      <strong>Filter Objects</strong>
      <Highlight className="javascript">
        {JSON.stringify(data.filter_object, null, 2)}
      </Highlight>
    </div>
  );
};

const RichDetails: React.FC = () => {
  const { filter_object: filterObjects, recipe } = useRecipeDetailsData();

  return filterObjects
    .sort((a, b) => {
      const samplingTypes = ["bucketSample", "stableSample"];
      if (samplingTypes.includes(a)) {
        return -1;
      } else if (samplingTypes.includes(b)) {
        return 1;
      }

      if (a.type > b.type) {
        return 1;
      } else if (a.type < b.type) {
        return -1;
      }

      return 0;
    })
    .map((fo, index) => {
      if (fo.type in FILTER_OBJECT_MAPPING) {
        const FilterObjectDetails = FILTER_OBJECT_MAPPING[fo.type];
        return (
          <FilterObjectDetails
            key={`${recipe?.id ?? "new-recipe"}-${index}`}
            data={fo}
          />
        );
      }

      return (
        <div key={index} className="mt-4">
          <strong>{splitCamelCase(fo.type, { case: "title-case" })}</strong>
          <Highlight className="javascript">
            {JSON.stringify(fo, null, 2)}
          </Highlight>
        </div>
      );
    });
};

export default FilteringDetails;
