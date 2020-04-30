import React from "react";
import { Panel, Tag } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import Generic from "devtools/components/recipes/details/arguments/Generic";
import Highlight from "devtools/components/common/Highlight";

export default function MessagingExperiment() {
  const data = useRecipeDetailsData();

  return (
    <Generic
      data={data.arguments}
      formatters={{
        branches(key, values) {
          return (
            <div className="mt-4">
              <div className="d-flex align-items-center">
                <div className="pr-2 font-weight-bold">Branches</div>
              </div>
              {values.map((value, index) => (
                <Panel key={index} bordered className="mt-2">
                  <div className="d-flex">
                    <div className="pr-5">
                      <div className="font-weight-bold">Ratio</div>
                      <div className="my-1">
                        <code>{value.ratio}</code>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="font-weight-bold">Slug</div>
                      <div className="my-1">
                        <code>{value.slug}</code>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="font-weight-bold">Groups</div>
                    <div className="my-1">
                      {value.groups.map((group) => (
                        <Tag key={group} className="rs-tag-rsuite">
                          {group}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <strong>Value</strong>
                    <Highlight className="javascript">
                      {JSON.stringify(value.value, null, 2)}
                    </Highlight>
                  </div>
                </Panel>
              ))}
            </div>
          );
        },
      }}
      ordering={[
        "userFacingName",
        "userFacingDescription",
        "experimenterUrl",
        "slug",
        "isEnrollmentPaused",
        "branches",
      ]}
    />
  );
}
