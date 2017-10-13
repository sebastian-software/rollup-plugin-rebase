import fs from "fs-extra"
import { rollup } from "rollup"
import denodeify from "denodeify"
import shortid from "shortid"
import rimraf from "rimraf"

import rebasePlugin from "../src"

const stat = denodeify(fs.stat)
const rimrafp = denodeify(rimraf)
const readFile = denodeify(fs.readFile)

const outputFolder = "./__tests__/output/"

function bundle(input, outputFile) {
  var plugin = rebasePlugin({ outputFolder, input, verbose: true })

  return rollup({
    input,
    external: plugin.isExternal,
    plugins: [ plugin ]
  }).then((result) =>
    result.write({
      format: "es",
      file: outputFile
    })
  )
}

function fileExists(name) {
  return stat(name).then((result) => true, (error) => false)
}

beforeAll(() => {
  return rimrafp(outputFolder)
})

test("Plain", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  return bundle("./__tests__/fixtures/plain.js", outputFile)
    .then(() => Promise.all([
      expect(fileExists(outputFile)).resolves.toBeTruthy()
    ]))
    .then(Promise.all([
      rimrafp(outputFile)
    ]))
})

test("Assets", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./__tests__/fixtures/assets.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(imageFile)).resolves.toBeTruthy(),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(imageFile),
      rimrafp(fontFile),
      rimrafp(deepFile)
    ]))
})

test("Outside Assets", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var imageFile = `${outputFolder}image-l1JhGTH9.png`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./__tests__/fixtures/deep/assets-outside.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(imageFile)).resolves.toBeTruthy(),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(imageFile),
      rimrafp(fontFile),
      rimrafp(deepFile)
    ]))
})

test("Mixed Assets", () => {
  var outputFile = `${outputFolder}${shortid()}.js`
  var fontFile = `${outputFolder}font-VrPi9W49.woff`
  var svgFile = `${outputFolder}cappuccino-YauiPPOt.svg`
  var deepFile = `${outputFolder}blank-hk4Yl7Ly.gif`

  return bundle("./__tests__/fixtures/deep/assets-mixed.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(svgFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(fontFile),
      rimrafp(svgFile),
      rimrafp(deepFile)
    ]))
})
