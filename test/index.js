import fs from "fs"
import rimraf from "rimraf"
import { rollup } from "rollup"
import denodeify from "denodeify"
import test from "ava"
import shortid from "shortid"

import relinkPlugin from "../src"

const stat = denodeify(fs.stat)
const rm = denodeify(rimraf)

const outputFolder = "./output/"

process.chdir(__dirname)

function run(entry, output) 
{
  var plugin = relinkPlugin({ outputFolder })

  return rollup({
    entry,
    external: plugin.isExternal,
    plugins: [ plugin ]
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
  var output = `${outputFolder}${shortid()}.js`
  return run("./fixtures/plain.js", output).then(() => Promise.all([
    fileExists(output).then((exists) => t.true(exists))
  ]))
})

test(t => {
  var output = `${outputFolder}${shortid()}.js`
  return run("./fixtures/assets.js", output).then(() => Promise.all([
    fileExists(output).then((exists) => t.true(exists)),
    fileExists(`${outputFolder}image-l1JhGTH9.png`).then((exists) => t.true(exists)),
    fileExists(`${outputFolder}font-VrPi9W49.woff`).then((exists) => t.true(exists))
  ]))
})
