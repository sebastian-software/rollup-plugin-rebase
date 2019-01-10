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
import { getHash } from "asset-hash"

const scriptExtensions = /^\.(json|mjs|js|jsx|es|esx|ts|tsx)$/

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
      keepName
    })
  ]
}

/* eslint-disable max-params */
async function processStyle(id, fileDest, keepName) {
  const content = await fs.readFile(id)
  const parser = styleParser[path.extname(id)]
  const processor = postcss(getPostCssPlugins(keepName))
  const text = content.toString()

  const result = await processor.process(text, {
    from: id,
    to: fileDest,
    extensions: Object.keys(styleParser),
    map: { inline: false },

    // Always uses parser... even for scss as we like to offer "normal" CSS in deployed files.
    parser
  })

  await Promise.all([
    fs.outputFile(fileDest, result.css),
    fs.outputFile(`${fileDest}.map`, result.map)
  ])
}

export default function rebase(options = {}) {
  const {
    include,
    exclude,
    verbose = false,
    keepName = false,
    assetFolder = ""
  } = options

  const filter = createFilter(include, exclude)
  const wrappers = {}
  const assets = {}
  const files = {}

  let root = null

  function rootRelative(file) {
    // Last sequence is for Windows support
    return path.relative(root, file).replace("\\", "/")
  }

  return {
    name: "rollup-plugin-rebase",

    /* eslint-disable complexity, max-statements */
    async resolveId(importee, importer) {
      if (!filter(importee)) {
        return null
      }

      // Ignore root files which are typically script files. Delegate to other
      // plugins or default behavior.
      if (!importer) {
        root = path.dirname(path.resolve(importee))
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
      let fileExt = path.extname(importee)
      if (fileExt === "" || scriptExtensions.test(fileExt)) {
        return null
      }

      // Handle style extension rename - outputting SugarSS is not possible.
      if (fileExt === ".sss") {
        fileExt = ".pcss"
      }

      const fileSource = path.resolve(path.dirname(importer), importee)
      const fileName = path.basename(importee, fileExt)
      const fileHash = await getHash(fileSource)
      const fileTarget = keepName ?
        `${fileName}~${fileHash}${fileExt}` :
        `${fileHash}${fileExt}`

      // Registering for our copying job when the bundle is created (kind of a job queue)
      // and respect any sub folder given by the configuration options.
      files[fileSource] = path.join(assetFolder, fileTarget)

      // Replacing slashes for Windows, as we need to use POSIX style to be compat
      // to Rollup imports / NodeJS resolve implementation.
      const assetId = path
        .join(root, assetFolder, fileTarget)
        .replace(/\\/g, "/")

      // console.log("Importer:", importer)
      // console.log("Asset-ID:", assetId)
      // console.log("Root-Dir:", root)
      const resolvedId = `${assetId}.js`

      // Register asset for exclusion handling in this function.
      // We need the additonal wrapping to be able to not just exclude the file
      // but to combine it with tweaking the import location. This indirection
      // makes this possible as we benefit from having a two-phase resolve.
      assets[assetId] = true

      // Store data for our dynamic wrapper generator in `load()`. This uses the
      // `assetId` to refer to our asset in its virtual new location which is
      // relative to the importer. This is enough to tweak the import statements
      // and make them flat and relative as desired in our output scenario.
      wrappers[resolvedId] = assetId

      return resolvedId
    },

    load(id) {
      if (wrappers[id] != null) {
        // It's not really any loader but kind of a dynamic code generator
        // which is just referring back to the asset we are interested in.
        // This is the magic behind the two-step-resolver and makes it possible
        // to have both: tweaked import references and externals together.
        const importee = wrappers[id]
        // console.log("Load:", importee)
        return `export { default } from "${importee}";`
      }

      return null
    },

    async generateBundle({ file, dir }) {
      const outputFolder = dir || path.dirname(file)

      try {
        // Copy all assets in parallel and waiting for it to complete.
        await Promise.all(
          Object.keys(files).map(async (fileSource) => {
            const fileDest = path.join(outputFolder, files[fileSource])
            const fileExt = path.extname(fileSource)

            // Style related files are processed, not just copied, so that
            // we can handle internal references in CSS as well.
            if (fileExt in styleParser) {
              if (verbose) {
                console.log(`Processing ${rootRelative(fileSource)} => ${rootRelative(fileDest)}...`)
              }

              await processStyle(fileSource, fileDest, keepName)
            } else {
              if (verbose) {
                console.log(`Copying ${rootRelative(fileSource)} => ${rootRelative(fileDest)}...`)
              }

              await fs.copy(fileSource, fileDest)
            }
          })
        )
      } catch (error) {
        throw new Error(`Error while copying files: ${error}`)
      }
    }
  }
}
