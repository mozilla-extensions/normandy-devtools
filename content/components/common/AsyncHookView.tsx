import React, { ReactElement } from "react";
import { Loader } from "rsuite";

import { AsyncHook } from "devtools/types/hooks";

type ToString = { toString: () => string };

// default export
interface AsyncHookViewProps<T extends ToString> {
  hook: AsyncHook<T>;
  children: (value: T) => ReactElement;
}

function AsyncHookView<T>({
  hook: { error, loading, value },
  children,
}: AsyncHookViewProps<T>): ReactElement {
  if (error) {
    let errMsg = error.toString();
    if (!errMsg.toLowerCase().startsWith("error")) {
      errMsg = `Error: ${errMsg}`;
    }

    return <div className="text-center mt-4 text-red">{errMsg}</div>;
  } else if (loading) {
    return (
      <div className="text-center mt-4">
        <Loader content="Loading&hellip;" />
      </div>
    );
  }

  return children(value);
}

export default AsyncHookView;
