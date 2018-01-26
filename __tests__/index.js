import fs from "fs-extra"
import { rollup } from "rollup"
import denodeify from "denodeify"
import rimraf from "rimraf"
import { dirname } from "path"

import rebasePlugin from "../src"

const stat = denodeify(fs.stat)
const rimrafp = denodeify(rimraf)
const readFile = denodeify(fs.readFile)

const outputFolder = "./__tests__/output/"

function bundle(input, outputFile, pluginOptions = {}) {
  var outputFolder = dirname(outputFile)
  var plugin = rebasePlugin({ outputFolder, input, ...pluginOptions })

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
  var outputFile = `${outputFolder}/plain/index.js`

  return bundle("./__tests__/fixtures/plain.js", outputFile)
    .then(() => Promise.all([
      expect(fileExists(outputFile)).resolves.toBeTruthy()
    ]))
    .then(Promise.all([
      rimrafp(outputFile)
    ]))
})

test("Assets", () => {
  var outputFile = `${outputFolder}/assets/index.js`

  var imageFile = `${outputFolder}/assets/XDOPW.png`
  var fontFile = `${outputFolder}/assets/fXQovA.woff`
  var deepFile = `${outputFolder}/assets/dnIKKh.gif`
  var cssFile = `${outputFolder}/assets/iQCqkl.css`
  var cssFont = `${outputFolder}/assets/gadyfD.woff`

  return bundle("./__tests__/fixtures/assets.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(imageFile)).resolves.toBeTruthy(),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFont)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(imageFile),
      rimrafp(fontFile),
      rimrafp(deepFile),
      rimrafp(cssFile),
      rimrafp(cssFont)
    ]))
})

test("Assets written to subfolder", () => {
  var outputFile = `${outputFolder}/assets-subfolder/index.js`

  var imageFile = `${outputFolder}/assets-subfolder/img/XDOPW.png`
  var fontFile = `${outputFolder}/assets-subfolder/img/fXQovA.woff`
  var deepFile = `${outputFolder}/assets-subfolder/img/dnIKKh.gif`
  var cssFile = `${outputFolder}/assets-subfolder/img/iQCqkl.css`
  var cssFont = `${outputFolder}/assets-subfolder/img/gadyfD.woff`

  var options = {outputFolder: `${outputFolder}assets-subfolder/img/`, outputBase: dirname(outputFile)}

  return bundle("./__tests__/fixtures/assets.js", outputFile, options)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(imageFile)).resolves.toBeTruthy(),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFont)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(imageFile),
      rimrafp(fontFile),
      rimrafp(deepFile),
      rimrafp(cssFile),
      rimrafp(cssFont)
    ]))
})

test("Outside Assets", () => {
  var outputFile = `${outputFolder}/outside/index.js`

  var imageFile = `${outputFolder}/outside/XDOPW.png`
  var fontFile = `${outputFolder}/outside/fXQovA.woff`
  var deepFile = `${outputFolder}/outside/dnIKKh.gif`
  var cssFile = `${outputFolder}/outside/iQCqkl.css`
  var cssFont = `${outputFolder}/outside/gadyfD.woff`

  return bundle("./__tests__/fixtures/deep/assets-outside.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(imageFile)).resolves.toBeTruthy(),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFont)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(imageFile),
      rimrafp(fontFile),
      rimrafp(deepFile),
      rimrafp(cssFile),
      rimrafp(cssFont)
    ]))
})

test("Mixed Assets", () => {
  var outputFile = `${outputFolder}/mixed/index.js`

  var fontFile = `${outputFolder}/mixed/fXQovA.woff`
  var svgFile = `${outputFolder}/mixed/dBNImC.svg`
  var deepFile = `${outputFolder}/mixed/dnIKKh.gif`
  var cssFile = `${outputFolder}/mixed/iQCqkl.css`
  var cssFont = `${outputFolder}/mixed/gadyfD.woff`

  return bundle("./__tests__/fixtures/deep/assets-mixed.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(svgFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFont)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(fontFile),
      rimrafp(svgFile),
      rimrafp(deepFile),
      rimrafp(cssFile),
      rimrafp(cssFont)
    ]))
})

test("Assets with hash appeneded", () => {
  var outputFile = `${outputFolder}/assets-hash-appened/index.js`

  var imageFile = `${outputFolder}/assets-hash-appened/image_XDOPW.png`
  var fontFile = `${outputFolder}/assets-hash-appened/font_fXQovA.woff`
  var deepFile = `${outputFolder}/assets-hash-appened/blank_dnIKKh.gif`
  var cssFile = `${outputFolder}/assets-hash-appened/css-font_iQCqkl.css`
  var cssFont = `${outputFolder}/assets-hash-appened/css-font_gadyfD.woff`

  return bundle("./__tests__/fixtures/assets.js", outputFile, {prependName: true})
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        readFile(outputFile, "utf-8").then((content) => {
          expect(content).toMatchSnapshot()
        }),
        expect(fileExists(imageFile)).resolves.toBeTruthy(),
        expect(fileExists(fontFile)).resolves.toBeTruthy(),
        expect(fileExists(deepFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFile)).resolves.toBeTruthy(),
        expect(fileExists(cssFont)).resolves.toBeTruthy()
      ])
    )
    .then(Promise.all([
      rimrafp(outputFile),
      rimrafp(imageFile),
      rimrafp(fontFile),
      rimrafp(deepFile),
      rimrafp(cssFile),
      rimrafp(cssFont)
    ]))
})
