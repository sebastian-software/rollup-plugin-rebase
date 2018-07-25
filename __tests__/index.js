import fs from "fs-extra"
import { rollup } from "rollup"

import rebasePlugin from "../src"

const outputFolder = "./__tests__/output/"

function bundle(input, outputFile, pluginOptions = {}) {
  const plugin = rebasePlugin(pluginOptions)

  return rollup({
    input,
    plugins: [ plugin ]
  }).then((result) =>
    result.write({
      format: "es",
      file: outputFile
    })
  )
}

function fileExists(name) {
  return fs.stat(name).then((result) => true, (error) => false)
}

beforeAll(() => {
  return fs.remove(outputFolder)
})

test("Plain", () => {
  const outputFile = `${outputFolder}/plain/index.js`

  return bundle("./__tests__/fixtures/plain.js", outputFile)
    .then(() => Promise.all([ expect(fileExists(outputFile)).resolves.toBeTruthy() ]))
    .then(Promise.all([ fs.remove(outputFile) ]))
})



test("Assets", () => {
  const outputFile = `${outputFolder}/hashing-basics/index.js`

  const imageFile = `${outputFolder}/hashing-basics/fEGHuKIT.png`
  const fontFile = `${outputFolder}/hashing-basics/cNxsXFOx.woff`
  const deepFile = `${outputFolder}/hashing-basics/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/hashing-basics/gayDQjlm.css`
  const cssFont = `${outputFolder}/hashing-basics/gadyfD.woff`

  return bundle("./__tests__/fixtures/assets.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        fs.readFile(outputFile, "utf-8").then((content) => {
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
        fs.remove(outputFile),
        fs.remove(imageFile),
        fs.remove(fontFile),
        fs.remove(deepFile),
        fs.remove(cssFile),
        fs.remove(cssFont)
      ])
    )
})

test("Assets written to subfolder", () => {
  const outputFile = `${outputFolder}/output-subfolder/index.js`

  const imageFile = `${outputFolder}/output-subfolder/static/fEGHuKIT.png`
  const fontFile = `${outputFolder}/output-subfolder/static/cNxsXFOx.woff`
  const deepFile = `${outputFolder}/output-subfolder/static/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/output-subfolder/static/gayDQjlm.css`
  const cssFont = `${outputFolder}/output-subfolder/static/gadyfD.woff`

  const options = {
    folder: "static"
  }

  return bundle("./__tests__/fixtures/assets.js", outputFile, options)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        fs.readFile(outputFile, "utf-8").then((content) => {
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
        fs.remove(outputFile),
        fs.remove(imageFile),
        fs.remove(fontFile),
        fs.remove(deepFile),
        fs.remove(cssFile),
        fs.remove(cssFont)
      ])
    )
})

test("Outside Asset Source Location", () => {
  const outputFile = `${outputFolder}/sources-outside/index.js`

  const imageFile = `${outputFolder}/sources-outside/fEGHuKIT.png`
  const fontFile = `${outputFolder}/sources-outside/cNxsXFOx.woff`
  const deepFile = `${outputFolder}/sources-outside/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/sources-outside/gayDQjlm.css`
  const cssFont = `${outputFolder}/sources-outside/gadyfD.woff`

  return bundle("./__tests__/fixtures/deep/assets-outside.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        fs.readFile(outputFile, "utf-8").then((content) => {
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
        fs.remove(outputFile),
        fs.remove(imageFile),
        fs.remove(fontFile),
        fs.remove(deepFile),
        fs.remove(cssFile),
        fs.remove(cssFont)
      ])
    )
})

test("Mixed Asset Source Locations", () => {
  const outputFile = `${outputFolder}/sources-mixed/index.js`

  const fontFile = `${outputFolder}/sources-mixed/cNxsXFOx.woff`
  const svgFile = `${outputFolder}/sources-mixed/foixBwnR.svg`
  const deepFile = `${outputFolder}/sources-mixed/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/sources-mixed/gayDQjlm.css`
  const cssFont = `${outputFolder}/sources-mixed/gadyfD.woff`

  return bundle("./__tests__/fixtures/deep/assets-mixed.js", outputFile)
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        fs.readFile(outputFile, "utf-8").then((content) => {
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
        fs.remove(outputFile),
        fs.remove(fontFile),
        fs.remove(svgFile),
        fs.remove(deepFile),
        fs.remove(cssFile),
        fs.remove(cssFont)
      ])
    )
})

test("Keep Name", () => {
  const outputFile = `${outputFolder}/keep-name/index.js`

  const imageFile = `${outputFolder}/keep-name/image_fEGHuKIT.png`
  const fontFile = `${outputFolder}/keep-name/font_cNxsXFOx.woff`
  const deepFile = `${outputFolder}/keep-name/blank_ceBqZEDY.gif`
  const cssFile = `${outputFolder}/keep-name/css-font_gayDQjlm.css`
  const cssFont = `${outputFolder}/keep-name/css-font_gadyfD.woff`

  return bundle("./__tests__/fixtures/assets.js", outputFile, {
    keepName: true
  })
    .then(() =>
      Promise.all([
        expect(fileExists(outputFile)).resolves.toBeTruthy(),
        fs.readFile(outputFile, "utf-8").then((content) => {
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
        fs.remove(outputFile),
        fs.remove(imageFile),
        fs.remove(fontFile),
        fs.remove(deepFile),
        fs.remove(cssFile),
        fs.remove(cssFont)
      ])
    )
})
