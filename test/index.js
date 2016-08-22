import fs from "fs"
import rimraf from "rimraf"
import { rollup } from "rollup"
import denodeify from "denodeify"
import test from "ava"
import shortid from "shortid"

import relinkPlugin from "../src"

const stat = denodeify(fs.stat)
const rm = denodeify(rimraf)

process.chdir(__dirname)

function run(entry, output) 
{
  return rollup({
    entry,
    plugins: [ relinkPlugin({ output }) ]
  })
  .then(bundle => bundle.write({
    dest: output
  }))
}

function fileExists(name) 
{
  return stat(name)
    .then(stat => true, err => false)
}

test(t => {
  var output = `./output/${shortid()}.js`
  return run("./fixtures/plain.js", output).then(() => Promise.all([
    fileExists(output).then((exists) => t.true(exists))
  ]))
})
