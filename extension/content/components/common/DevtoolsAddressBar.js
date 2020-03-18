import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Icon, Input, InputGroup } from "rsuite";

export default function DevtoolsAddressBar() {
  function showLocation(location) {
    return "ext+normandy:/" + location.pathname + location.search;
  }

  function handleKeyPress(ev) {
    if (ev.key == "Enter") {
      let internalLocation = address.replaceAll(/^(ext\+normandy:\/*)/gi, "/");
      history.push(internalLocation);
    }
  }

  let location = useLocation();
  let history = useHistory();
  let [address, setAddress] = React.useState("");
  React.useEffect(() => setAddress(showLocation(location)), [location]);

  return (
    <div className="ndt-address-bar">
      <InputGroup>
        <InputGroup.Addon>
          <Icon icon="link" />
        </InputGroup.Addon>
        <Input
          type="text"
          value={address}
          onChange={ev => setAddress(ev.target.value)}
          onKeyPress={handleKeyPress}
        />
        <InputGroup.Button>
          <Icon icon="copy" />
        </InputGroup.Button>
      </InputGroup>
    </div>
  );
}
