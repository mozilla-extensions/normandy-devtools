import React, { ReactNode } from "react";

interface OnlyIfProps {
  type: string;
  children?: ReactNode;
}
export const OnlyIf: React.FC<OnlyIfProps> = ({ type, children }) => {
  if (__ENV__ === type) {
    return <>{children}</>;
  }
  return null;
};
