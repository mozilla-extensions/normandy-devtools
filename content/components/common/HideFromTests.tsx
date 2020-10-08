import React from "react";

export const HideFromTests: React.FC = ({ children }) => {
  if (__TESTING__) {
    return null;
  }

  return <>{children}</>;
};
