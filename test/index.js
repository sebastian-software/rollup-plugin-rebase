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
  var outputFile = `${outputFolder}${shortid()}.js`
  return run("./fixtures/plain.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => t.true(exists)),
    rm(outputFile)
  ]))
})

test(t => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`

  return run("./fixtures/assets.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => t.true(exists)),
    fileExists(imageFile).then((exists) => t.true(exists)),
    fileExists(fontFile).then((exists) => t.true(exists)),
    rm(outputFile),
    rm(imageFile),
    rm(fontFile)
  ]))
})
