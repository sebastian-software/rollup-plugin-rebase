import fs from "fs"
import rimraf from "rimraf"
import { rollup } from "rollup"
import denodeify from "denodeify"
import test from "ava"

import relinkPlugin from "../src"

const dest = "output/output.js"
const outputFolder = "./src"

const stat = denodeify(fs.stat)

process.chdir(__dirname)

function run(entry) 
{
  return rollup({
    entry,
    plugins: [ relinkPlugin({ outputFolder }) ]
  })
  .then(bundle => bundle.write({
    dest
  }))
}

function fileExists(name) 
{
  return stat(name)
    .then(stat => true, err => false)
}

test(t => {
  return run("./fixtures/plain.js").then(() => Promise.all([
    fileExists("./output/output.js").then((exists) => t.true(exists))
  ]))
})
