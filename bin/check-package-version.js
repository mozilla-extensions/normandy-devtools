#!/usr/bin/env node

/* Check that the version in package.json matches the most recent git tag. */

const { execSync } = require("child_process");
const process = require("process");

const packageData = require("../package.json");

async function main() {
  const gitTag = execSync("git describe --abbrev=0").toString().trim();
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
