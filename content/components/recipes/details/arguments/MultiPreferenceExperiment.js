import PropTypes from "prop-types";
import React from "react";
import { Panel, Tag } from "rsuite";

import AsyncHookView from "devtools/components/common/AsyncHookView";
import HelpIcon from "devtools/components/common/HelpIcon";
import {
  booleanFormatter,
  multiColumnFormatter,
} from "devtools/components/recipes/details/arguments/formatters";
import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";
import { useExperimenterDetailsData } from "devtools/contexts/experimenterDetails";
import { useBranchTestingIds } from "devtools/hooks/testingIds";

export default function MultiPreferenceExperiment({ data }) {
  const branchTestingIds = useBranchTestingIds(data);
  const experimenterData = useExperimenterDetailsData();

  return (
    <GenericArguments
      data={data.arguments}
      formatters={{
        "row-1": multiColumnFormatter(
          ["isEnrollmentPaused", "isHighPopulation"],
          {
            isEnrollmentPaused: booleanFormatter,
            isHighPopulation: booleanFormatter,
          },
        ),
        branches(key, value) {
          const panels = value.map((branch, index) => {
            const preferences = Object.entries(branch.preferences);

            const preferenceRows = preferences.map(
              (
                [
                  preferenceName,
                  { preferenceType, preferenceBranchType, preferenceValue },
                ],
                index,
              ) => {
                const prefNameParts = preferenceName.split(".");
                const displayName = prefNameParts.map((p, i) => {
                  return (
                    <React.Fragment key={i}>
                      {i < prefNameParts.length - 1 ? `${p}.` : p}
                      <wbr />
                    </React.Fragment>
                  );
                });
                return (
                  <tr key={index}>
                    <td>
                      <code>{displayName}</code>
                    </td>
                    <td>
                      <Tag>{preferenceType}</Tag>
                    </td>
                    <td>
                      {preferenceType === "boolean" ? (
                        <Tag color={preferenceValue ? "green" : "red"}>
                          {preferenceValue ? "True" : "False"}
                        </Tag>
                      ) : (
                        <code>{preferenceValue}</code>
                      )}
                    </td>
                    <td>
                      <Tag>{preferenceBranchType}</Tag>
                    </td>
                  </tr>
                );
              },
            );

            return (
              <Panel key={index} bordered className="mt-2">
                <div className="d-flex w-100">
                  <div className="flex-basis-0 flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div className="pr-2 font-weight-bold">Slug</div>
                    </div>
                    <div className="my-1 text-subtle">
                      <code>{branch.slug}</code>
                    </div>
                  </div>
                  <div className="flex-basis-0 flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div className="pr-2 font-weight-bold">Description</div>
                    </div>
                    <div className="my-1 text-subtle margin-right">
                      {experimenterData.variants
                        ? experimenterData.variants[branch.slug]
                        : null}
                    </div>
                  </div>
                  <div className="flex-basis-0 flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div className="pr-2 font-weight-bold">Ratio</div>
                    </div>
                    <div className="my-1 text-subtle">
                      <code>{branch.ratio}</code>
                    </div>
                  </div>
                  <div className="flex-basis-0 flex-grow-1">
                    <div className="d-flex align-items-center">
                      <div className="pr-2 font-weight-bold">
                        Testing clientId
                        <HelpIcon>
                          Setting the preference{" "}
                          <code>app.normandy.clientId</code> to this value will
                          satisfy the sampling filter and choose this branch
                          when enrolling. It will not automatically satisfy
                          other filters.
                        </HelpIcon>
                      </div>
                    </div>
                    <div className="my-1 text-subtle">
                      <AsyncHookView hook={branchTestingIds}>
                        {(value) => (
                          <code>
                            app.normandy.clientId = {value[branch.slug]}
                          </code>
                        )}
                      </AsyncHookView>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="d-flex align-items-center">
                    <div className="pr-2 font-weight-bold">Preferences</div>
                  </div>
                  <div className="mt-3 mb-1 text-subtle">
                    <table className="data-table w-100">
                      <thead>
                        <tr>
                          <th>Preference Name</th>
                          <th>Type</th>
                          <th>Value</th>
                          <th>Preference Branch</th>
                        </tr>
                      </thead>
                      <tbody>{preferenceRows}</tbody>
                    </table>
                  </div>
                </div>
              </Panel>
            );
          });

          return (
            <div className="mt-4">
              <div className="d-flex align-items-center">
                <div className="pr-2 font-weight-bold">Branches</div>
              </div>
              <div className="mt-3 mb-1 text-subtle">{panels}</div>
            </div>
          );
        },
      }}
      omit={["isEnrollmentPaused", "isHighPopulation"]}
      ordering={[
        "userFacingName",
        "userFacingDescription",
        "slug",
        "experimentDocumentUrl",
        "row-1",
        "branches",
      ]}
    />
  );
}

MultiPreferenceExperiment.propTypes = {
  data: PropTypes.object,
};
