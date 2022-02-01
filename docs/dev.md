# Development

There are two variants of Normandy Devtools: the extension and the webpage. The
extension has super powers because it can integrate deeply into Firefox. The
webpage is more accessible and a little easier to work on.

## Setup

Clone the repository, and install the dependencies:

```sh
git clone https://github.com/mozilla/normandy-devtools.git
cd normandy-devtools
yarn
```

> One of Normandy Devtools core features is interacting with various
> services. Although these services often have stage and dev instances that
> can be worked with, it can be helpful to have your own local copies. As an
> optional setup step, considering [setting those up](./local-servers).

## Extension

To work on the extension version of NDT, you'll need to have Firefox Nightly.

> WARNING: This workflow is only useful for working on the extension itself. If
> you aren't working on the code yourself, you should get a release build from
> [the releases page on Github][releases]. Non-development builds of NDT involve
> a signing process not covered here.

To run the extension in development mode, you can use the `watch-ext` command to
build the extension, package it and install it into a Nightly temporary profile:

```sh
yarn watch-ext
```

> NOTE: If you are seeing an error while trying to run `watch-ext` make sure
> that Nightly is installed on your system. If you are on Linux check that
> `firefox-nightly` is on your PATH.

## Web

To work on the web version of NDT, you can use any modern version of Firefox and the `watch-web` command:

```sh
yarn watch-web
```

## Configuration

You may want to configure some aspects of your build for local development.
To do this you need to create a `.env` file in the root directory of the
project and set the relevant values:

### NDT_DEFAULT_ENV

This sets the default environment set at startup when you load the
extension.

Must be one of `prod`, `stage`, `dev` or `local`.

### NDT_LOCAL_READ_ONLY_URL

The URL for your local readable instance of Normandy server.

### NDT_LOCAL_WRITEABLE_URL

The URL for your local writeable instance of Normandy server.

### NDT_LOCAL_OIDC_CLIENT_ID

The Auth0 client ID used by your local instance of Normandy server.

### NDT_LOCAL_OIDC_DOMAIN

The Auth0 domain of the tenant used by your local instance of Normandy
server.

### NDT_LOCAL_EXPERIMENTER_URL

The URL for your local instance of Experimenter.

## Debugging with React Devtools

If you are in development mode such as by running the command `yarn
watch-dev` or `yarn watch-web` you will be able to debug the extension with
React Devtools.

To start React Devtools run the following in a separate shell:

```sh
yarn react-devtools
```

Now simply reload the extension or webpage. It should connect to React Devtools.

## Release

Releases are built automatically and available on the
[releases pages on Github][releases]. There is no manual build process, since it
relies on having secrets to sign the add-on.

[releases]: https://github.com/mozilla-extensions/normandy-devtools/releases

### Development releases

We now provide automatically built and signed XPIs for development purposes. These can
be found by looking at the list of checks for the commit you want an XPI for and
click through to the TaskCluster task for "dep-signing-normandy-devtools".

You should now be able to find an XPI file in the list of artifacts.

Before attempting to install these stage-signed builds you will need to change a
preference in `about:config`:

- Create a new boolean preference named `xpinstall.signatures.dev-root` and set it to
  `true`.

If you wish to use this profile with a mix of stage-signed XPIs and
production-signed/AMO-signed XPIs you can alternatively change the following
preferences in `about:config`:

- Change `xpinstall.signatures.required` to `false`.
- Change `extensions.experiments.enabled` to `true`.

Please note: Either of these are considered insecure options and could render your
profile vulnerable to malicious addons that are unsigned or signed with dubious keys.
We recommend that you do not use your regular profile for these purposes.
