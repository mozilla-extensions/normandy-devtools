import React from "react";
import { useLocation, useHistory } from "react-router-dom";

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
      <img src="/images/extensionGeneric-16.svg" />
      <input
        type="text"
        value={address}
        onChange={ev => setAddress(ev.target.value)}
        onKeyPress={handleKeyPress}
      />
    </div>
  );
}
