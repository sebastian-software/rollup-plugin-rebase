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
  const outputFolder = dirname(outputFile)
  const plugin = rebasePlugin({ outputFolder, input, ...pluginOptions })

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
  const outputFile = `${outputFolder}/plain/index.js`

  return bundle("./__tests__/fixtures/plain.js", outputFile)
    .then(() =>
      Promise.all([ expect(fileExists(outputFile)).resolves.toBeTruthy() ])
    )
    .then(Promise.all([ rimrafp(outputFile) ]))
})

test("Assets", () => {
  const outputFile = `${outputFolder}/assets/index.js`

  const imageFile = `${outputFolder}/assets/XDOPW.png`
  const fontFile = `${outputFolder}/assets/fXQovA.woff`
  const deepFile = `${outputFolder}/assets/dnIKKh.gif`
  const cssFile = `${outputFolder}/assets/iQCqkl.css`
  const cssFont = `${outputFolder}/assets/gadyfD.woff`

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
    .then(
      Promise.all([
        rimrafp(outputFile),
        rimrafp(imageFile),
        rimrafp(fontFile),
        rimrafp(deepFile),
        rimrafp(cssFile),
        rimrafp(cssFont)
      ])
    )
})

test("Assets written to subfolder", () => {
  const outputFile = `${outputFolder}/assets-subfolder/index.js`

  const imageFile = `${outputFolder}/assets-subfolder/img/XDOPW.png`
  const fontFile = `${outputFolder}/assets-subfolder/img/fXQovA.woff`
  const deepFile = `${outputFolder}/assets-subfolder/img/dnIKKh.gif`
  const cssFile = `${outputFolder}/assets-subfolder/img/iQCqkl.css`
  const cssFont = `${outputFolder}/assets-subfolder/img/gadyfD.woff`

  const options = {
    outputFolder: `${outputFolder}assets-subfolder/img/`,
    outputBase: dirname(outputFile)
  }

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
    .then(
      Promise.all([
        rimrafp(outputFile),
        rimrafp(imageFile),
        rimrafp(fontFile),
        rimrafp(deepFile),
        rimrafp(cssFile),
        rimrafp(cssFont)
      ])
    )
})

test("Outside Assets", () => {
  const outputFile = `${outputFolder}/outside/index.js`

  const imageFile = `${outputFolder}/outside/XDOPW.png`
  const fontFile = `${outputFolder}/outside/fXQovA.woff`
  const deepFile = `${outputFolder}/outside/dnIKKh.gif`
  const cssFile = `${outputFolder}/outside/iQCqkl.css`
  const cssFont = `${outputFolder}/outside/gadyfD.woff`

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
    .then(
      Promise.all([
        rimrafp(outputFile),
        rimrafp(imageFile),
        rimrafp(fontFile),
        rimrafp(deepFile),
        rimrafp(cssFile),
        rimrafp(cssFont)
      ])
    )
})

test("Mixed Assets", () => {
  const outputFile = `${outputFolder}/mixed/index.js`

  const fontFile = `${outputFolder}/mixed/fXQovA.woff`
  const svgFile = `${outputFolder}/mixed/dBNImC.svg`
  const deepFile = `${outputFolder}/mixed/dnIKKh.gif`
  const cssFile = `${outputFolder}/mixed/iQCqkl.css`
  const cssFont = `${outputFolder}/mixed/gadyfD.woff`

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
    .then(
      Promise.all([
        rimrafp(outputFile),
        rimrafp(fontFile),
        rimrafp(svgFile),
        rimrafp(deepFile),
        rimrafp(cssFile),
        rimrafp(cssFont)
      ])
    )
})

test("Assets with hash appeneded", () => {
  const outputFile = `${outputFolder}/assets-hash-appened/index.js`

  const imageFile = `${outputFolder}/assets-hash-appened/image_XDOPW.png`
  const fontFile = `${outputFolder}/assets-hash-appened/font_fXQovA.woff`
  const deepFile = `${outputFolder}/assets-hash-appened/blank_dnIKKh.gif`
  const cssFile = `${outputFolder}/assets-hash-appened/css-font_iQCqkl.css`
  const cssFont = `${outputFolder}/assets-hash-appened/css-font_gadyfD.woff`

  return bundle("./__tests__/fixtures/assets.js", outputFile, {
    prependName: true
  })
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
    .then(
      Promise.all([
        rimrafp(outputFile),
        rimrafp(imageFile),
        rimrafp(fontFile),
        rimrafp(deepFile),
        rimrafp(cssFile),
        rimrafp(cssFont)
      ])
    )
})
