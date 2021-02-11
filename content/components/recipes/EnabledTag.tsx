import React from "react";
import { Tag } from "rsuite";

import { Revision } from "devtools/types/recipes";
import { revisionIsPausable } from "devtools/utils/recipes";

// default export
const EnabledTag: React.FC<{ revision: Revision; className?: string }> = ({
  revision,
  className,
}) => {
  let tag = (
    <Tag className={className} color="red">
      Disabled
    </Tag>
  );

  if (revision.enabled) {
    if (revisionIsPausable(revision) && revision.arguments.isEnrollmentPaused) {
      tag = (
        <Tag className={className} color="yellow">
          Paused
        </Tag>
      );
    } else {
      tag = (
        <Tag className={className} color="green">
          Enabled
        </Tag>
      );
    }
  }

  return <div className={className}>{tag}</div>;
};

export default EnabledTag;
