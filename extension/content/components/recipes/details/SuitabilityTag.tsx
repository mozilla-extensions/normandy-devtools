// @ts-nocheck
import React from "react";
import { Icon, Popover, Tag, Whisper } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import { convertToV1Recipe } from "devtools/utils/recipes";

const { normandy } = browser.experiments;

const SUITABILITIES_DOCS_URL =
  "https://firefox-source-docs.mozilla.org/toolkit/components/normandy/normandy/suitabilities.html#suitabilities";

const SUITABILITIES_DESCRIPTIONS = {
  FILTER_MATCH: (
    <p>
      All checks have passed, and the recipe is suitable to execute in this
      client. Experiments and Rollouts should enroll or update. Heartbeats
      should be shown to the user, etc.
    </p>
  ),
  FILTER_MISMATCH: (
    <>
      <p>
        This client does not match the recipe’s filter, but it is otherwise a
        suitable recipe.
      </p>
      <p>
        This should be considered a permanent error, since the filter explicitly
        does not match the client.
      </p>
    </>
  ),
  FILTER_ERROR: (
    <>
      <p>
        There was an error while evaluating the filter. It is unknown if this
        client matches this filter. This may be temporary, due to network
        errors, or permanent due to syntax errors.
      </p>
      <p>
        This should be considered a temporary error, because it may be the
        result of infrastructure, such as Classify Client, temporarily failing.
      </p>
    </>
  ),
  CAPABILITIES_MISMATCH: (
    <>
      <p>
        The recipe requires capabilities that this recipe runner does not have.
        Use caution when interacting with this recipe, as it may not match the
        expected schema.
      </p>
      <p>
        This should be considered a permanent error, because it is the result of
        a choice made on the server.
      </p>
    </>
  ),
  SIGNATURE_ERROR: (
    <>
      <p>
        The recipe’s signature is not valid. If any action is taken this recipe
        should be treated with extreme suspicion.
      </p>
      <p>
        This should be considered a temporary error, because it may be related
        to server errors, local clocks, or other temporary problems.
      </p>
    </>
  ),
  ARGUMENTS_INVALID: (
    <>
      <p>
        The arguments of the recipe do not match the expected schema for the
        named action.
      </p>
      <p>
        This should be considered a permanent error, since the arguments are
        generally validated by the server. This likely represents an
        unrecognized compatibility error.
      </p>
    </>
  ),
};

interface SuitabilityTagProps {
  revision?: Revision;
  hide?: Array<string>;
}

// default export
const SuitabilityTag: React.FC<SuitabilityTagProps> = ({
  revision,
  hide = [],
}) => {
  const [suitabilities, setSuitabilities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  if (!revision) {
    revision = useRecipeDetailsData();
  }

  React.useEffect(() => {
    (async (): Promise<void> => {
      const v1Recipe = convertToV1Recipe(revision);
      const suitabilities = await normandy.getRecipeSuitabilities(v1Recipe);
      setSuitabilities(suitabilities);
      setLoading(false);
    })();
  }, [revision]);

  let popoverMessage = "Loading&hellip;";
  if (suitabilities) {
    popoverMessage = (
      <dl
        className="documentation my-0 text-subtle"
        style={{ maxWidth: "300px" }}
      >
        {suitabilities.map((s) => {
          const dt = s.replace("RECIPE_SUITABILITY_", "");
          const dd = SUITABILITIES_DESCRIPTIONS[dt];

          return (
            <React.Fragment key={s}>
              <dt>{dt}</dt>
              {dd ? <dd>{dd}</dd> : null}
            </React.Fragment>
          );
        })}
      </dl>
    );
  }

  if (!loading && !suitabilities.some((s) => !hide.includes(s))) {
    return null;
  }

  let color;
  let suitabilityMessage = "Checking suitabilities";
  if (suitabilities.length === 1) {
    if (suitabilities[0] === "RECIPE_SUITABILITY_FILTER_MATCH") {
      color = "green";
      suitabilityMessage = "All checks passed";
    } else if (suitabilities[0] === "RECIPE_SUITABILITY_FILTER_MISMATCH") {
      color = "red";
      suitabilityMessage = "Filter mismatch";
    } else {
      color = "orange";
      suitabilityMessage = suitabilities[0]
        .replace("RECIPE_SUITABILITY_", "")
        .replace("_", " ");
    }
  } else if (suitabilities.length > 1) {
    color = "orange";
    suitabilityMessage = "Some checks failed";
  }

  const popoverTitle = (
    <div className="d-flex">
      <div className="flex-grow-1 pr-1">Suitability Details</div>
      <div>
        <a
          className="text-subtle"
          href={SUITABILITIES_DOCS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon icon="help-o" />
        </a>
      </div>
    </div>
  );

  let popover = <></>;
  if (suitabilities.length) {
    popover = <Popover title={popoverTitle}>{popoverMessage}</Popover>;
  }

  return (
    <Whisper placement="autoVerticalEnd" speaker={popover} trigger="hover">
      <Tag className="cursor-context-menu text-nowrap" color={color}>
        {suitabilityMessage}
      </Tag>
    </Whisper>
  );
};

export default SuitabilityTag;
