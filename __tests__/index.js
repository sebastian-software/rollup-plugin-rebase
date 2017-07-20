import fs from "fs-extra"
import { rollup } from "rollup"
import denodeify from "denodeify"
import test from "ava"
import shortid from "shortid"

import rebasePlugin from "../src"

const stat = denodeify(fs.stat)
const rimraf = denodeify(fs.remove)
const readFile = denodeify(fs.readFile)

const outputFolder = "./output/"

process.chdir(__dirname)

function bundle(entry, output)
{
  var plugin = rebasePlugin({ outputFolder, entry, verbose: true })

  return rollup({
    entry,
    external: plugin.isExternal,
    plugins: [ plugin ]
  })
    .then((result) => result.write({
      format: "es",
      dest: output
    }))
}

function fileExists(name)
{
  return stat(name)
    .then((result) => true, (error) => false)
}

test((check) => {
  var outputFile = `${outputFolder}${shortid()}.js`
  return bundle("./fixtures/plain.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => check.true(exists)),
    rimraf(outputFile)
  ]))
})

test((check) => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./fixtures/assets.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => check.true(exists)),
    readFile(outputFile, "utf-8").then((content) => {
      /* eslint-disable no-template-curly-in-string */
      var expectedContent = "import _VrPi9W49 from './font-VrPi9W49.woff';\nimport _l1JhGTH9 from './image-l1JhGTH9.png';\nimport _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';\n\nvar assets = `${_VrPi9W49}|${_l1JhGTH9}|${_hk4Yl7Ly}`;\n\nexport default assets;\n"
      return check.is(content, expectedContent)
    }),
    fileExists(imageFile).then((exists) => check.true(exists)),
    fileExists(fontFile).then((exists) => check.true(exists)),
    fileExists(deepFile).then((exists) => check.true(exists)),
    rimraf(outputFile),
    rimraf(imageFile),
    rimraf(fontFile),
    rimraf(deepFile)
  ]))
})

test((check) => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./fixtures/deep/assets-outside.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => check.true(exists)),
    readFile(outputFile, "utf-8").then((content) => {
      /* eslint-disable no-template-curly-in-string */
      var expectedContent = "import _VrPi9W49 from './font-VrPi9W49.woff';\nimport _l1JhGTH9 from './image-l1JhGTH9.png';\nimport _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';\n\n/* eslint-disable filenames/match-regex */\nvar assetsOutside = `${_VrPi9W49}|${_l1JhGTH9}|${_hk4Yl7Ly}`;\n\nexport default assetsOutside;\n"
      return check.is(content, expectedContent)
    }),
    fileExists(imageFile).then((exists) => check.true(exists)),
    fileExists(fontFile).then((exists) => check.true(exists)),
    fileExists(deepFile).then((exists) => check.true(exists)),
    rimraf(outputFile),
    rimraf(imageFile),
    rimraf(fontFile),
    rimraf(deepFile)
  ]))
})

test((check) => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var svgFile = `${outputFolder}cappuccino-YauiPPOt.svg`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./fixtures/deep/assets-mixed.js", outputFile).then(() => Promise.all([
    fileExists(outputFile).then((exists) => check.true(exists)),
    readFile(outputFile, "utf-8").then((content) => {
      /* eslint-disable no-template-curly-in-string */
      var expectedContent = "import _VrPi9W49 from './font-VrPi9W49.woff';\nimport _YauiPPOt from './cappuccino-YauiPPOt.svg';\nimport _hk4Yl7Ly from './blank-hk4Yl7Ly.gif';\n\n/* eslint-disable filenames/match-regex */\nvar assetsMixed = `${_VrPi9W49}|${_YauiPPOt}|${_hk4Yl7Ly}`;\n\nexport default assetsMixed;\n"
      return check.is(content, expectedContent)
    }),
    fileExists(fontFile).then((exists) => check.true(exists)),
    fileExists(svgFile).then((exists) => check.true(exists)),
    fileExists(deepFile).then((exists) => check.true(exists)),
    rimraf(outputFile),
    rimraf(fontFile),
    rimraf(svgFile),
    rimraf(deepFile)
  ]))
})
