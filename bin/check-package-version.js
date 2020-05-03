#!/usr/bin/env node

/* Check that the version in package.json matches the most recent git tag. */

const util = require("util");
const process = require("process");
const exec = util.promisify(require("child_process").exec);

const packageData = require("../package.json");

async function main() {
  const gitTag = (await exec("git describe --abbrev=0")).stdout.trim();
  const { version } = packageData;

  if (gitTag !== `v${version}`) {
    console.error(
      `The version in package.json and the latest git tag don't match!`,
    );
    console.error(`  package.json: v${version}`);
    console.error(`  git describe: ${gitTag}`);
    process.exit(1);
  }
}

main();
