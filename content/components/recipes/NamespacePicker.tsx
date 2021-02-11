import cx from "classnames";
import React, { useEffect } from "react";
import { InputPicker, Loader } from "rsuite";

import { useSelectedEnvironmentState } from "devtools/contexts/environment";
import { useNamespaceInfo } from "devtools/contexts/namespaces";
import { makeCompare } from "devtools/utils/helpers";

interface Props {
  onChange: (newNamespace: string) => void;
  value: null | string;
  className?: string;
}

// default export
const NamespacePicker: React.FC<Props> = ({
  onChange,
  value = null,
  className,
}) => {
  const { selectedKey: selectedEnvironment } = useSelectedEnvironmentState();
  const namespacesInfo = useNamespaceInfo();
  useEffect(() => {
    namespacesInfo.updateNamespaceNames();
  }, [selectedEnvironment]);

  const namespaces = new Set(namespacesInfo.namespaces);
  namespaces.add(value);

  const pickerData = Array.from(namespaces).map((ns) => ({
    label: ns,
    value: ns,
  }));

  return (
    <div className="d-flex align-items-center position-relative">
      <InputPicker
        className={cx("flex-grow-1", className)}
        cleanable={false}
        creatable={true}
        data={pickerData}
        data-testid="namespace-picker"
        searchable={true}
        sort={() => makeCompare((v) => v.label)}
        value={value}
        onChange={onChange}
      />
      {namespacesInfo.isLoading() && (
        <Loader
          className="position-absolute absolute-right"
          style={{ zIndex: 5, right: "28px" }}
        />
      )}
    </div>
  );
};

export default NamespacePicker;
