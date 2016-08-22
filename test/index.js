import fs from "fs"
import rimraf from "rimraf"
import rollup from "rollup"
import test from "ava"

import relinkPlugin from "../src"

const dest = "output/output.js"
const outputFolder = "./src"

process.chdir(__dirname)

function run(entry, limit) {
  return rollup.rollup({
    entry,
    plugins: [relinkPlugin({ outputFolder })],
  }).then(bundle => bundle.write({
    dest,
  })).then(() => plugin.write({dest}))
}

function assertExists(name, shouldExist = true) {
  return promise(fs.stat, name)
  .then(stat => true, err => false)
  .then(exists => assert.ok(exists === shouldExist))
}

