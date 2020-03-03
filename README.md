# Normandy Devtools

A set of tools for interacting with Normandy without using a server.

# Features

* Disables automatic runs of Normandy
* Allows triggering full runs of Normandy manually
* Lists all recipes from the server, including if their filter matches the current browser
* Allows executing individual recipes, regardless of filters
* See current filter expression context
* Evaluate filter expressions
* Use a different Normandy environment (does not change browser settings)
* Create custom one-off recipes for testing

## Planned features

* Choose branch for preference studies ([Issue #2](https://github.com/mozilla/normandy-devtools/issues/2))
* Temporarily change filter expressions context ([Issue #4](https://github.com/mozilla/normandy-devtools/issues/4))
* Check signature state of recipes  ([Issue #5](https://github.com/mozilla/normandy-devtools/issues/5))

# Installation

This extension uses a web extension experimental API to communicate with
Normandy. It requires Firefox 62 or higher.

1. Download the latest release from the [releases page on
   Github](https://github.com/mozilla/normandy-devtools/releases).

2. Open `about:addons`, and choose "Install from File" from the gear in the top
   right. Choose the `.zip` file downloaded from  the releases page.

3. Click on the new hand icon in the browser toolbar.

Note that the extension will not automatically update.


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

To run the extension in development mode, you'll need two commands in two separate terminals:

First automatically rebuild the extension files

```
$ yarn watch:webpack
```

Second, automatically rebuild the XPI file and update it in a Nightly temporary profile

```
$ yarn watch:extension --firefox path/to/nightly
```

# Release

Releases are built automatically and available on the
[releases pages on Github](https://github.com/mozilla/normandy-devtools/releases).
There is no manual build process, since it relies on having secrets to sign the add-on.
