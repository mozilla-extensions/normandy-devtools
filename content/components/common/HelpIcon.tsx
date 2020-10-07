import React, { ReactNode } from "react";
import { Whisper, Tooltip, Icon } from "rsuite";

const HelpIcon: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Whisper
      enterable
      placement="autoVertical"
      speaker={<Tooltip>{children}</Tooltip>}
      trigger="click"
    >
      <Icon
        className="m-half"
        icon="question-circle"
        role="button"
        style={{ cursor: "pointer" }}
      />
    </Whisper>
  );
};

export default HelpIcon;
