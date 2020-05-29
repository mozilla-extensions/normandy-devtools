// @ts-nocheck
import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  Avatar,
  Badge,
  ControlLabel,
  Form,
  FormGroup,
  Header,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Loader,
  Modal,
  Popover,
  SelectPicker,
  Whisper,
} from "rsuite";

import Logo from "devtools/components/svg/Logo";
import {
  login,
  logout,
  useEnvironmentDispatch,
  useEnvironments,
  useSelectedEnvironmentState,
} from "devtools/contexts/environment";
import { upperCaseFirst } from "devtools/utils/helpers";
import { useExtensionUrl } from "devtools/hooks/urls";

export default function AppHeader() {
  return (
    <Header>
      <div className="app-header">
        <span className="logo">
          <Logo />
          <span className="logo-text">
            Normandy
            <br />
            Devtools
          </span>
        </span>
        <span className="fluid">
          <AddressBar />
        </span>
        <span>
          <EnvironmentConfigurator />
        </span>
        <span className="authenticator">
          <Authenticator />
        </span>
      </div>
    </Header>
  );
}

function AddressBar() {
  const extensionUrl = useExtensionUrl();
  const history = useHistory();
  const [address, setAddress] = React.useState("");
  let inputRef;
  let triggerRef;

  React.useEffect(() => setAddress(extensionUrl.toString()), [extensionUrl]);

  const handleKeyPress = (ev) => {
    if (ev.key === "Enter") {
      const addressMatch = address.match(/ext\+normandy:\/(.+?)$/);
      history.push(addressMatch[1]);
    }
  };

  const handleCopyClick = () => {
    inputRef.select();
    document.execCommand("copy");
    inputRef.setSelectionRange(0, 0);
    inputRef.blur();
    triggerRef.show();
    setTimeout(() => {
      triggerRef.hide();
    }, 2000);
  };

  const copyTooltip = <Popover>URL copied to clipboard</Popover>;

  return (
    <InputGroup>
      <InputGroup.Addon>
        <Icon icon="link" />
      </InputGroup.Addon>
      <Input
        inputRef={(ref) => {
          inputRef = ref;
        }}
        type="text"
        value={address}
        onChange={(value) => setAddress(value)}
        onKeyPress={handleKeyPress}
      />
      <Whisper
        placement="bottom"
        speaker={copyTooltip}
        trigger={[]}
        triggerRef={(ref) => {
          triggerRef = ref;
        }}
      >
        <InputGroup.Button onClick={handleCopyClick}>
          <Icon icon="copy" />
        </InputGroup.Button>
      </Whisper>
    </InputGroup>
  );
}

function EnvironmentConfigurator() {
  const [showEnvironmentModal, setShowEnvironmentModal] = React.useState(false);

  const environments = useEnvironments();
  const envOptions = Object.keys(environments).map((key) => ({
    label: upperCaseFirst(key),
    value: key,
  }));

  const { connectionStatus, selectedKey } = useSelectedEnvironmentState();
  const history = useHistory();
  const location = useLocation();

  const onEnvironmentChange = (key) => {
    history.push(location.pathname.replace(/^\/.+?\/(.+?)$/, `/${key}/$1`));
  };

  let Wrapper = React.Fragment;
  let wrapperProps = {};
  if (connectionStatus) {
    Wrapper = Badge;
    wrapperProps = { className: "green" };
  }

  return (
    <>
      <Wrapper {...wrapperProps}>
        <IconButton
          icon={<Icon icon="globe" />}
          onClick={() => {
            setShowEnvironmentModal(true);
          }}
        >
          <strong>Environment:&nbsp;</strong>
          <strong className="text-primary">
            {upperCaseFirst(selectedKey)}
          </strong>
        </IconButton>
      </Wrapper>

      <Modal
        show={showEnvironmentModal}
        onHide={() => {
          setShowEnvironmentModal(false);
        }}
      >
        <Modal.Header>
          <Modal.Title>Configure Environment</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FormGroup>
              <ControlLabel>Current Environment</ControlLabel>
              <SelectPicker
                cleanable={false}
                data={envOptions}
                defaultValue={selectedKey}
                searchable={false}
                onChange={onEnvironmentChange}
              />
            </FormGroup>
          </Modal.Body>
        </Form>
      </Modal>
    </>
  );
}

function Authenticator() {
  const {
    auth,
    environment,
    isLoggingIn,
    selectedKey,
  } = useSelectedEnvironmentState();
  const dispatch = useEnvironmentDispatch();

  const handleLoginClick = () => {
    login(dispatch, selectedKey, environment);
  };

  const handleLogoutClick = () => {
    logout(dispatch, selectedKey);
  };

  if (isLoggingIn) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 w-110px">
        <Loader content="Logging In&hellip;"></Loader>
      </div>
    );
  }

  if (auth.result) {
    const { idTokenPayload: profile } = auth.result;
    return (
      <Whisper
        placement="bottomEnd"
        speaker={
          <Popover>
            <div>
              Signed in as:
              <br />
              <strong>{profile.email}</strong>
            </div>
            <ul className="link-list">
              <li onClick={handleLogoutClick}>Log Out</li>
            </ul>
          </Popover>
        }
        trigger="click"
      >
        <div className="d-flex cursor-pointer">
          <Avatar
            circle
            alt={profile.email.substring(0, 1)}
            size="sm"
            src={profile.picture}
          />
          <Icon icon="caret-down" />
        </div>
      </Whisper>
    );
  }

  return (
    <IconButton
      appearance="primary"
      icon={<Icon icon="user" />}
      onClick={handleLoginClick}
    >
      Log In
    </IconButton>
  );
}
