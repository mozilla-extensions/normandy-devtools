import React from "react";
import PropTypes from "prop-types";
import { Panel, Tag } from "rsuite";

import GenericArguments from "devtools/components/recipes/details/arguments/GenericArguments";
import Highlight from "devtools/components/common/Highlight";

export default function MessagingExperiment({ data }) {
  return (
    <GenericArguments
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
                      <div className="my-1 text-subtle">
                        <code>{value.ratio}</code>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="font-weight-bold">Slug</div>
                      <div className="my-1 text-subtle">
                        <code>{value.slug}</code>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="font-weight-bold">Groups</div>
                    <div className="my-1">
                      {value.groups.map((group) => (
                        <Tag
                          key={group}
                          className="rs-tag-rsuite font-family-monospace"
                        >
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
      ordering={["slug", "isEnrollmentPaused", "branches"]}
    />
  );
}

MessagingExperiment.propTypes = {
  data: PropTypes.object,
};
