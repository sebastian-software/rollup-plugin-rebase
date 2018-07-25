/* eslint-disable filenames/match-exported */
import path from "path"
import fs from "fs-extra"
import postcss from "postcss"
import postcssImport from "postcss-import"
import postcssSass from "postcss-sass"
import postcssScss from "postcss-scss"
import postcssSmartAsset from "postcss-smart-asset"
import postcssSugarSS from "sugarss"

import { createFilter } from "rollup-pluginutils"
import { getHashedName } from "asset-hash"

const defaultExclude = [
  /\.json$/,
  /\.mjs$/,
  /\.js$/,
  /\.jsx$/,
  /\.es$/,
  /\.esx$/,
  /\.ts$/,
  /\.tsx$/,
  /\.vue$/
]

const styleParser = {
  ".pcss": null,
  ".css": null,
  ".sss": postcssSugarSS,
  ".scss": postcssScss,
  ".sass": postcssSass
}

function getPostCssPlugins(keepName) {
  return [
    postcssImport(),
    postcssSmartAsset({
      url: "copy",
      useHash: true,
      prependName: keepName
    })
  ]
}

/* eslint-disable max-params */
async function processStyle(id, dest, keepName) {
  const content = await fs.readFile(id)
  const parser = styleParser[path.extname(id)]
  const result = await postcss(getPostCssPlugins(keepName)).process(content.toString(), {
    from: id,
    to: dest,
    extensions: Object.keys(styleParser),
    map: { inline: true },

    // Always uses parser... even for scss as we like to offer "normal" CSS in deployed files.
    parser
  })

  await fs.outputFile(dest, result)
}

export default function rebase(options = {}) {
  const { include, exclude = defaultExclude, verbose, keepName = false, folder = "" } = options

  const filter = createFilter(include, exclude)
  const wrappers = new Set()
  const assets = new Set()
  const files = {}

  return {
    name: "rollup-plugin-rebase",

    /* eslint-disable complexity, max-statements */
    async resolveId(importee, importer) {
      if (!filter(importee)) {
        if (verbose) {
          console.log("Ignoring [resolve]:", importee)
        }

        return null
      }

      if (!importer) {
        return null
      }

      if (assets[importee] != null) {
        return false
      }

      const fileExt = path.extname(importee)
      if (fileExt === "") {
        return null
      }

      const fileSource = path.resolve(path.dirname(importer || ""), importee)
      const fileName = path.basename(importee, fileExt)

      const destId = await getHashedName(fileSource)
      const destFilename = keepName ? `${fileName}_${destId}` : destId

      const fileHash = destId.slice(0, -fileExt.length)

      files[fileSource] = path.join(folder, destFilename)

      const assetId = path.join(path.dirname(importer), folder, destFilename)
      const resolvedId = `${assetId}.js`

      assets[assetId] = fileHash
      wrappers[resolvedId] = assetId

      return resolvedId
    },

    load(id) {
      if (wrappers[id] != null) {
        return `export { default } from "${wrappers[id]}";`
      }

      return null
    },

    async generateBundle({ file }) {
      const outputFolder = path.dirname(file)

      await Promise.all(
        Object.keys(files).map(async (fileSource) => {
          const fileDest = path.join(outputFolder, files[fileSource])
          const fileExt = path.extname(fileSource)

          if (fileExt in styleParser) {
            if (verbose) {
              console.log(`Processing ${fileSource} => ${fileDest}...`)
            }
            await processStyle(fileSource, fileDest, keepName)
          } else {
            if (verbose) {
              console.log(`Copying ${fileSource} => ${fileDest}...`)
            }

            await fs.copy(fileSource, fileDest)
          }
        })
      )
    }
  }
}
