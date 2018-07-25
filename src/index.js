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
  const { include, exclude = defaultExclude, verbose = true, keepName = false, folder = "" } = options

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

      // Ignore root files which are typically script files. Delegate to other
      // plugins or default behavior.
      if (!importer) {
        return null
      }

      // If we process an import request of an already processed asset
      // we deal with it to exclude it from any further bundling through Rollup.
      if (assets[importee] != null) {
        return false
      }

      // We do not process files which do not have a file extensions,
      // cause all assets typically have one. By returning `null` we delegate
      // the resolver to other plugins.
      const fileExt = path.extname(importee)
      if (fileExt === "") {
        return null
      }

      const fileSource = path.resolve(path.dirname(importer), importee)
      const fileName = path.basename(importee, fileExt)

      if (verbose) {
        console.log(`Analysing: ${fileSource}...`)
      }

      const destId = await getHashedName(fileSource)
      const destFilename = keepName ? `${fileName}_${destId}` : destId

      const fileHash = destId.slice(0, -fileExt.length)

      files[fileSource] = path.join(folder, destFilename)

      // Replacing slashes for Windows, as we need to use POSIX style to be compat
      // to Rollup imports / NodeJS resolve implementation.
      const assetId = path.join(path.dirname(importer), folder, destFilename).replace(/\\/g, "/")
      const resolvedId = `${assetId}.js`

      // Register asset for exclusion handling in this function.
      // We need the additonal wrapping to be able to not just exclude the file
      // but to combine it with tweaking the import location. This indirection
      // makes this possible as we benefit from having a two-phase resolve.
      assets[assetId] = fileHash

      // Store data for our dynamic wrapper generator in `load()`. This uses the
      // `assetId` to refer to our asset in its virtual new location which is
      // relative to the importer. This is enough to tweak the import statements
      // and make them flat and relative as desired in our output scenario.
      wrappers[resolvedId] = assetId

      return resolvedId
    },

    load(id) {
      if (wrappers[id] != null) {
        // It's not really any loader bit
        const importee = wrappers[id]
        return `export { default } from "${importee}";`
      }

      return null
    },

    async generateBundle({ file }) {
      const outputFolder = path.dirname(file)

      try {
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
      } catch(error) {
        throw new Error("Error while copying files:", error)
      }
    }
  }
}
