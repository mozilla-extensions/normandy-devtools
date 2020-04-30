import React from "react";
import { Panel, Tag } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import {
  booleanFormatter,
  multiColumnFormatter,
} from "devtools/components/recipes/details/arguments/formatters";

export default function PreferenceExperiment() {
  const data = useRecipeDetailsData();

  return (
    <Generic
      data={data.arguments}
      formatters={{
        "row-1": multiColumnFormatter(["isEnrollmentPaused", "isHighVolume"], {
          isEnrollmentPaused: booleanFormatter,
          isHighVolume: booleanFormatter,
        }),
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
                    <>
                      {i < prefNameParts.length - 1 ? `${p}.` : p}
                      <wbr />
                    </>
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
                      <div className="pr-2 font-weight-bold">Ratio</div>
                    </div>
                    <div className="my-1 text-subtle">
                      <code>{branch.ratio}</code>
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
      omit={["isEnrollmentPaused", "isHighVolume"]}
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
