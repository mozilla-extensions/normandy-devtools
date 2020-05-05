# Development

You'll need to use Nightly and about:debugging to use unsigned development
versions of the add-on.

> WARNING: This workflow is only useful for working on the extension itself.
> If you aren't working on the code yourself, you should get a release build
> from above.

```
$ git clone https://github.com/mozilla/normandy-devtools.git
$ cd normandy-devtools
$ yarn install
```

To run the extension in development mode, you can simply use the `watch` command to
build the extension, package it and install it into a Nightly temporary profile:

```
$ yarn watch
```

> NOTE: If you are seeing an error while trying to run `watch` make sure that Nightly
> is installed on your system and if you are on Linux make sure that `firefox-nightly`
> is on your PATH.

## Configuration

You may want to configure some aspects of your build for local development.
To do this you need to create a `.env` file in the root directory of the 
project and set the relevant values:

#### NDT_DEFAULT_ENV

This sets the default environment set at startup when you load the 
extension.

Must be one of `prod`, `stage`, `dev` or `local`. 

#### NDT_LOCAL_READ_ONLY_URL

The URL for your local readable instance of Normandy server.

#### NDT_LOCAL_WRITEABLE_URL

The URL for your local writeable instance of Normandy server.

#### NDT_LOCAL_OIDC_CLIENT_ID

The Auth0 client ID used by your local instance of Normandy server.

#### NDT_LOCAL_OIDC_DOMAIN

The Auth0 domain of the tenant used by your local instance of Normandy 
server.

#### NDT_LOCAL_EXPERIMENTER_URL

The URL for your local instance of Experimenter.

## Debugging with React Devtools

If you are in development mode such as by running the command `yarn watch` you will 
be able to debug the extension with React Devtools. 

To start React Devtools simply run:
```
$ yarn react-devtools
```

Now simply reload the extension. It should connect to React Devtools.

## Release

Releases are built automatically and available on the
[releases pages on Github](https://github.com/mozilla/normandy-devtools/releases).
There is no manual build process, since it relies on having secrets to sign the add-on.
