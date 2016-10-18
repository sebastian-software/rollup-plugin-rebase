import fs from "fs"
import rimraf from "rimraf"
import { rollup } from "rollup"
import denodeify from "denodeify"
import test from "ava"
import shortid from "shortid"

import relinkPlugin from "../src"

const stat = denodeify(fs.stat)
const rm = denodeify(rimraf)
const readFile = denodeify(fs.readFile)

const outputFolder = "./output/"

process.chdir(__dirname)

function run(entry, output)
{
  var plugin = relinkPlugin({ outputFolder, entry, verbose: true })

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
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return run("./fixtures/assets.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => t.true(exists)),
    readFile(outputFile, "utf-8").then(function(content) {
var expectedContent = `import _VrPi9W49 from './font-VrPi9W49.woff';
import _l1JhGTH9 from './image-l1JhGTH9.png';
import _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';

var assets = _VrPi9W49 + "|" + _l1JhGTH9 + "|" + _hk4Yl7Ly;

export default assets;
`
      t.is(content, expectedContent)
    }),
    fileExists(imageFile).then((exists) => t.true(exists)),
    fileExists(fontFile).then((exists) => t.true(exists)),
    fileExists(deepFile).then((exists) => t.true(exists)),
    rm(outputFile),
    rm(imageFile),
    rm(fontFile),
    rm(deepFile)
  ]))
})
