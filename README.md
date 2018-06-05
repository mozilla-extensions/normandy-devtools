# Normandy Devtools

A set of tools for interacting with Normandy without using a server.

# Features

* Disables automatic runs of Normandy
* Allows triggering full runs of Normandy manually
* Lists all recipes from the server, including if their filter matches the current browser
* Allows executing individual recipes, regardless of filters
* See current filter expression context
* Evaluate filter expressions

## Planned features

* Use a different Normandy environment, such as stage or local development ([Issue #1](https://github.com/mozilla/normandy-devtools/issues/1))
* Choose branch for preference studies ([Issue #2](https://github.com/mozilla/normandy-devtools/issues/2))
* Create custom one-off recipes for testing ([Issue #3](https://github.com/mozilla/normandy-devtools/issues/3))
* Temporarily change filter expressions context ([Issue #4](https://github.com/mozilla/normandy-devtools/issues/4))
* Check signature state of recipes  ([Issue #5](https://github.com/mozilla/normandy-devtools/issues/5))

# Installation

This extension uses a web extension experimental API to communicate with
Normandy. It requires Firefox 62 or higher. As of version 0.5.0, the
add-on can be installed on any compatible Nightly without changing preferences.

It is recommended to use Nightly with a dedicated profile while development of
this extension active.

1. Download the latest release from the [releases page on
   Github](https://github.com/mozilla/normandy-devtools/releases).

2. Open `about:addons`, and choose "Install from File" from the gear in the top
   right. Choose the `.zip` file downloaded from  the releases page.

3. Click on the new hand icon in the browser toolbar.

Note that the extension will not automatically update.


# Development

Prerequisites for working the extension:

```
$ git clone https://github.com/mozilla/normandy-devtools.git
$ cd normandy-devtools
$ yarn install
```

To run the extension in development mode:

```
$ yarn watch
```

To build the extension in production mode:

```
$ yarn build
```

This will create a zip file `./web-ext-artifacts/normandy-devtools-$VERSION.zip`.

To sign the zip file, use [mozilla-addon-signer](https://github.com/rehandalal/mozilla-addon-signer).
