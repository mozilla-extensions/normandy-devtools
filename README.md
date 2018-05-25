# Normandy Devtools

A set of tools for interacting with Normandy without using a server.

# Features

* Disables automatic runs of Normandy
* Allows triggering full runs of Normandy manually
* Lists all recipes from the server, including if their filter matches the current browser
* Allows executing individual recipes, regardless of filters

## Planned features

* Use a different Normandy environment, such as stage or local development
* Choose branch for preference studies
* Create custom one-off recipes for testing
* See current filter expression context
* Evaluate filter expressions with arbitrary context
* Check signature state of recipes

# Installation

This extension uses a web extension experimental API to communicate with
Normandy. Because of that, it can only be installed on pre-release or unbranded
builds of Firefox, and signature checking must be turned off. Additionally, it
requires Firefox 62 or higher.

It is recommended to use Nightly with a dedicated profile while development of
this extension active.

1. Change `xpinstall.signatures.required` to `false`, so that unsigned
   extensions can be installed.

2. Download the latest release from the [releases page on
   Github](https://github.com/mozilla/normandy-devtools/releases).

3. Open `about:addons`, and choose "Install from File" from the gear in the top
   right. Choose the `.zip` file downloaded from  the releases page.

4. Click on the icon in the browser toolbar.

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
