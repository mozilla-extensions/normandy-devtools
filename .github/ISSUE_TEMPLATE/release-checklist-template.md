---
name: Release Checklist Template
about: The checklist for making a new release
title: Next Release
labels: release
assignees: ''

---

Welcome Release Captain! ⛵️

<!-- Note to release captains: while filing this issue, replace ALL_CAPS words with their appropriate values and then delete this instruction. -->

- [ ] Assign this issue to yourself.
- [ ] Set up your workspace as described [in the docs](https://mozilla-extensions.github.io/normandy-devtools/#/dev).
- [ ] Checkout and update the `main` branch locally.
- [ ] Start a new branch. It will be renamed later, so don't worry about the name.
- [ ] Update `CHANGELOG.md` to reflect the changes since the last version.
  - Use the command `git log --merges vOLD_VERSION..` to see commits between then and now.
- [ ] Use yarn to bump the version. Use one of the following, depending on the version difference:
  - `yarn version --patch` - Bug fixes, doc updates, and other small changes.
  - `yarn version --minor` - New  features and backwards compatible pages.
  - `yarn version --major` - Breaking changes and major new features.
  - Note: This will commit your changes.
- [ ] If necessary, rename your branch with `git branch -m release-NEW_VERSION`.
- [ ] Rename this issue with the version number as `Release vNEW_VERSION`
- [ ] Make a PR to merge this branch. Add `Fixes #XYZ` to the body where XYZ is this issue.
- [ ] Get the change reviewed and merged.
- [ ] `git push --tags`
- [ ] Update the Github release for the newly pushed tag with the contents from `CHANGELOG.md`.
- [ ] Create a new extension release with Shipit.
- [ ] Attach the signed extension file to the Github release.
- [ ] Create a release issue for with the [release issue template][].
- [ ] Close this issue.

[release issue template]:
  https://github.com/mozilla-extensions/normandy-devtools/issues/new?assignees=&labels=release&template=release-checklist.md&title=Next+Release
