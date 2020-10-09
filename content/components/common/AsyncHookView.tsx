import React, { ReactElement } from "react";

import { AsyncHook } from "devtools/types/hooks";

type ToString = { toString: () => string };

// default export
interface AsyncHookViewProps {
  hook: AsyncHook<ToString>;
  children: (value: ToString) => ReactElement;
}

const AsyncHookView: React.FC<AsyncHookViewProps> = ({
  hook: { error, loading, value },
  children = (v): ReactElement => <>{v.toString()}</>,
}) => {
  if (error) {
    let errMsg = error.toString();
    if (!errMsg.toLowerCase().startsWith("error")) {
      errMsg = `Error: ${errMsg}`;
    }

    return <>{errMsg}</>;
  } else if (loading) {
    return <>Loading</>;
  }

  return children(value);
};

export default AsyncHookView;
