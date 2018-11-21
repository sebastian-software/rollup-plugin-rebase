import fs from "fs-extra"
import { rollup } from "rollup"

import rebasePlugin from "../src"

const outputFolder = "./__tests__/output/"

async function bundle(input, outputFile, pluginOptions = {}) {
  const plugin = rebasePlugin(pluginOptions)

  const result = await rollup({
    input,
    plugins: [ plugin ]
  })

  await result.write({
    format: "es",
    file: outputFile
  })
}

beforeAll(() => {
  return fs.remove(outputFolder)
})

test("Plain", async () => {
  const outputFile = `${outputFolder}/plain/index.js`

  await bundle("./__tests__/fixtures/plain.js", outputFile)

  await Promise.all([
    expect(fs.pathExists(outputFile)).resolves.toBeTruthy()
  ])

  await Promise.all([
    fs.remove(outputFile)
  ])
})

test("Assets", async () => {
  const outputFile = `${outputFolder}/hashing-basics/index.js`

  const imageFile = `${outputFolder}/hashing-basics/bAFTozQS.png`
  const fontFile = `${outputFolder}/hashing-basics/cVoexIsj.woff`
  const deepFile = `${outputFolder}/hashing-basics/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/hashing-basics/vAjnOYXZ.css`
  const cssFileMap = `${outputFolder}/hashing-basics/vAjnOYXZ.css.map`
  const cssFont = `${outputFolder}/hashing-basics/dRqwXHnd.woff`

  await bundle("./__tests__/fixtures/assets.js", outputFile)

  await Promise.all([
    expect(fs.pathExists(outputFile)).resolves.toBeTruthy(),
    fs.readFile(outputFile, "utf-8").then((content) => {
      expect(content).toMatchSnapshot()
    }),
    expect(fs.pathExists(imageFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(fontFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(deepFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFont)).resolves.toBeTruthy()
  ])

  await Promise.all([
    fs.remove(outputFile),
    fs.remove(imageFile),
    fs.remove(fontFile),
    fs.remove(deepFile),
    fs.remove(cssFile),
    fs.remove(cssFileMap),
    fs.remove(cssFont)
  ])
})

test("Assets written to subfolder", async () => {
  const outputFile = `${outputFolder}/output-subfolder/index.js`

  const imageFile = `${outputFolder}/output-subfolder/static/bAFTozQS.png`
  const fontFile = `${outputFolder}/output-subfolder/static/cVoexIsj.woff`
  const deepFile = `${outputFolder}/output-subfolder/static/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/output-subfolder/static/vAjnOYXZ.css`
  const cssFileMap = `${outputFolder}/output-subfolder/static/vAjnOYXZ.css.map`
  const cssFont = `${outputFolder}/output-subfolder/static/dRqwXHnd.woff`

  const options = {
    folder: "static"
  }

  await bundle("./__tests__/fixtures/assets.js", outputFile, options)

  await Promise.all([
    expect(fs.pathExists(outputFile)).resolves.toBeTruthy(),
    fs.readFile(outputFile, "utf-8").then((content) => {
      expect(content).toMatchSnapshot()
    }),
    expect(fs.pathExists(imageFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(fontFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(deepFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFont)).resolves.toBeTruthy()
  ])

  await Promise.all([
    fs.remove(outputFile),
    fs.remove(imageFile),
    fs.remove(fontFile),
    fs.remove(deepFile),
    fs.remove(cssFile),
    fs.remove(cssFileMap),
    fs.remove(cssFont)
  ])
})

test("Outside Asset Source Location", async () => {
  const outputFile = `${outputFolder}/sources-outside/index.js`

  const imageFile = `${outputFolder}/sources-outside/bAFTozQS.png`
  const fontFile = `${outputFolder}/sources-outside/cVoexIsj.woff`
  const deepFile = `${outputFolder}/sources-outside/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/sources-outside/vAjnOYXZ.css`
  const cssFileMap = `${outputFolder}/sources-outside/vAjnOYXZ.css.map`
  const cssFont = `${outputFolder}/sources-outside/dRqwXHnd.woff`

  await bundle("./__tests__/fixtures/deep/assets-outside.js", outputFile)

  await Promise.all([
    expect(fs.pathExists(outputFile)).resolves.toBeTruthy(),
    fs.readFile(outputFile, "utf-8").then((content) => {
      expect(content).toMatchSnapshot()
    }),
    expect(fs.pathExists(imageFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(fontFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(deepFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFont)).resolves.toBeTruthy()
  ])

  await Promise.all([
    fs.remove(outputFile),
    fs.remove(imageFile),
    fs.remove(fontFile),
    fs.remove(deepFile),
    fs.remove(cssFile),
    fs.remove(cssFileMap),
    fs.remove(cssFont)
  ])
})

test("Mixed Asset Source Locations", async () => {
  const outputFile = `${outputFolder}/sources-mixed/index.js`

  const fontFile = `${outputFolder}/sources-mixed/cVoexIsj.woff`
  const svgFile = `${outputFolder}/sources-mixed/foixBwnR.svg`
  const deepFile = `${outputFolder}/sources-mixed/ceBqZEDY.gif`
  const cssFile = `${outputFolder}/sources-mixed/vAjnOYXZ.css`
  const cssFileMap = `${outputFolder}/sources-mixed/vAjnOYXZ.css.map`
  const cssFont = `${outputFolder}/sources-mixed/dRqwXHnd.woff`

  await bundle("./__tests__/fixtures/deep/assets-mixed.js", outputFile)

  await Promise.all([
    expect(fs.pathExists(outputFile)).resolves.toBeTruthy(),
    fs.readFile(outputFile, "utf-8").then((content) => {
      expect(content).toMatchSnapshot()
    }),
    expect(fs.pathExists(fontFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(svgFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(deepFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFont)).resolves.toBeTruthy()
  ])

  await Promise.all([
    fs.remove(outputFile),
    fs.remove(fontFile),
    fs.remove(svgFile),
    fs.remove(deepFile),
    fs.remove(cssFile),
    fs.remove(cssFileMap),
    fs.remove(cssFont)
  ])
})

test("Keep Name", async () => {
  const outputFile = `${outputFolder}/keep-name/index.js`

  const imageFile = `${outputFolder}/keep-name/image_bAFTozQS.png`
  const fontFile = `${outputFolder}/keep-name/SourceSerifPro-Bold.ttf_cVoexIsj.woff`
  const deepFile = `${outputFolder}/keep-name/blank_ceBqZEDY.gif`
  const cssFile = `${outputFolder}/keep-name/css-font_vAjnOYXZ.css`
  const cssFileMap = `${outputFolder}/keep-name/css-font_vAjnOYXZ.css.map`
  const cssFont = `${outputFolder}/keep-name/SourceSerifPro-Light.ttf_dRqwXHnd.woff`

  await bundle("./__tests__/fixtures/assets.js", outputFile, {
    keepName: true
  })

  await Promise.all([
    expect(fs.pathExists(outputFile)).resolves.toBeTruthy(),
    fs.readFile(outputFile, "utf-8").then((content) => {
      expect(content).toMatchSnapshot()
    }),
    expect(fs.pathExists(imageFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(fontFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(deepFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFile)).resolves.toBeTruthy(),
    expect(fs.pathExists(cssFont)).resolves.toBeTruthy()
  ])

  await Promise.all([
    fs.remove(outputFile),
    fs.remove(imageFile),
    fs.remove(fontFile),
    fs.remove(deepFile),
    fs.remove(cssFile),
    fs.remove(cssFileMap),
    fs.remove(cssFont)
  ])
})

test("Asset source location when importer is deep", async () => {
  const outputFile = `${outputFolder}/importer-within/index.js`
  const imageFile = `${outputFolder}/importer-within/ceBqZEDY.gif`
  const imageFileImport = `import blankUrl from './ceBqZEDY.gif'`

  await bundle("./__tests__/fixtures/deep/assets-importer-within.js", outputFile)

  await Promise.all([
    expect(fs.pathExists(imageFile)).resolves.toBeTruthy(),
    fs.readFile(outputFile, "utf-8").then((content) => {
      expect(content).toEqual(expect.stringContaining(imageFileImport))
    })
  ])

  await Promise.all([
    fs.remove(outputFile),
    fs.remove(imageFile)
  ])
})
