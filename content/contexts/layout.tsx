import React from "react";

interface LayoutData {
  container: HTMLElement;
}

const initialState: LayoutData = {
  container: document.body,
};

export const layoutContext = React.createContext<LayoutData>(initialState);
const { Provider } = layoutContext;

export const LayoutProvider: React.FC<LayoutData> = ({
  container,
  children,
}) => {
  return <Provider value={{ container }}>{children}</Provider>;
};
