# Changelog

## Next

- Add a one-click pause and request review button to recipe detail pages
- Switch custom protocol to `web+normandy://` (`ext+normandy://` will redirect).

## v2.1.1

- Improve CSP settings
- Stop minifying the extension

## v2.1.0

- Add UI for namespace sample filters
- Add bucket filter testing ID calculator
- Fix an issue where stale data could be shown for recently edited recipes
- Fix an issue preventing `show-heartbeat` recipes from being created

## v2.0.3

- Re-release due to deployment errors

## v2.0.2

- Fix an issue where `isEnrollmentPaused` is missing for recipes imported from
  Experimenter

## v2.0.1

- Fix an issue with the generic filter object UI that prevented saving the form

## v2.0.0

- New theme, including dark mode
- Add support for recipe editing
- Better environment switching
- Fix `isHighPopulation` in preference experiments
- Add support for recipe cloning
- Add support to request approval and review recipes
- Add support to enable and disable recipes
- Require comments when making changes to recipes
- Track VPN status, and use admin servers when available
- Better auth handling

## v1.1.2

- Better compatibility with Firefox 75

## v1.1.1

- Dependency updates

## v1.1.0

- New recipe view modal
- Check recipe suitabilities

## v1.0.0

- Don't use dot notation for filter context keys with special chars
- Add "Copy to arbitrary editor" button on recipe listing
- Add protocol handler and pretty address bar for pretty, shareable urls
- Load filter context dynamically instead of with a static list
- Make filter context more robust and support appinfo

## v0.8.0

- New visual design
- Ability to read from Stage and Dev Normandy servers
- Ability to run recipe directly from compatible JSON

## v0.7.0

- Fixed compatibility with Normandy API

## v0.6.0

- Added page for enrolled and past pref studies
- Added page for enrolled and past add-on studies

## v0.5.2

- Fixed support for Firefox 62

## v0.5.1

- Added support for `os` context item

## v0.5.0

- Use ACE editor for filter expressions

## v0.4.2

- Fix recipes view

## v0.4.1

- Fix compatibility with Nightly 62

## v0.4.0

- Add filter devtool
- Minimum version is now Firefox 62

## v0.3.0

- Added icons
- Improved docs

## v0.2.0

- Reduce bundle size

## v0.1.0

- Initial Release
