/* eslint-disable filenames/match-exported */
import path from "path"
import denodeify from "denodeify"
import fs from "fs-extra"
import { createFilter } from "rollup-pluginutils"
import { getHashedName } from "asset-hash"
import { resolve, dirname } from "path"

import postcss from "postcss"

import postcssImport from "postcss-import"
import postcssSmartAsset from "postcss-smart-asset"

import postcssSugarSS from "sugarss"
import postcssScss from "postcss-scss"
import postcssSass from "postcss-sass"

const copyAsync = denodeify(fs.copy)
const writeAsync = denodeify(fs.outputFile)

const styleParser = {
  ".pcss": null,
  ".css": null,
  ".sss": postcssSugarSS,
  ".scss": postcssScss,
  ".sass": postcssSass
}

function getPostCssPlugins(prependName) {
  return [
    postcssImport(),
    postcssSmartAsset({
      url: "copy",
      useHash: true,
      prependName
    })
  ]
}

/* eslint-disable max-params */
async function processStyle(id, dest, prependName) {
  const content = await fs.readFile(id)
  const parser = styleParser[path.extname(id)]
  const result = await postcss(getPostCssPlugins(prependName))
    .process(content.toString(), {
      from: id,
      to: dest,
      extensions: Object.keys(styleParser),
      map: { inline: true },

      // Always uses parser... even for scss as we like to offer "normal" CSS in deployed files.
      parser
    })

  await writeAsync(dest, result)
}

const externalIds = {}

const defaultExclude = [
  /\.json$/,
  /\.mjs$/,
  /\.js$/,
  /\.jsx$/,
  /\.ts$/,
  /\.tsx$/,
  /\.vue$/
]

export default function rebase(options = {}) {
  const {
    include,
    exclude = defaultExclude,
    input,
    outputFolder,
    outputBase,
    verbose,
    prependName
  } = options

  const filter = createFilter(include, exclude)
  const wrappers = new Set()
  const assets = new Set()

  return {
    name: "rollup-plugin-rebase",

    /* eslint-disable complexity, max-statements */
    async resolveId(importee, importer) {
      console.log("resolveId(" + importee + "," + importer + ")")

      if (!filter(importee)) {
        if (verbose) {
          // console.log("Ignoring [resolve]:", importee)
        }

        return null
      }

      if (assets[importee] != null) {
        console.log("-> External:", importee)
        return false
      }

      if (!importer) {
        return null
      }

      const fileExt = path.extname(importee)

      if (fileExt === "") {
        return null
      }

      const sourceFilePath = resolve(dirname(importer || ""), importee)

      const fileSource = sourceFilePath

      const fileName = path.basename(fileSource, fileExt)

      const destId = await getHashedName(fileSource)
      const destFilename = prependName ? `${fileName}_${destId}` : destId

      const fileDest = path.resolve(outputFolder, destFilename)
      const fileHash = destId.slice(0, -fileExt.length)

      if (fileExt in styleParser) {
        if (verbose) {
          // console.log(`Processing ${fileSource} => ${fileDest}...`)
        }

        await processStyle(fileSource, fileDest, prependName)
      } else {
        if (verbose) {
          // console.log(`Copying ${fileSource} => ${fileDest}...`)
        }

        await fs.copy(fileSource, fileDest)
      }

      const assetId = "./" + path.basename(fileDest)
      const resolvedId = assetId + ".js"

      console.log("-> Registering asset:", assetId)
      console.log("-> Resolved:", resolvedId)
      assets[assetId] = fileHash
      wrappers[resolvedId] = assetId

      return resolvedId
    },

    load(id) {
      console.log("Load:", id)
      if (wrappers[id] != null) {
        const asset = wrappers[id]

        console.log("Return JS for asset:", id)
        console.log("->", `export { default } from "${asset}";`)

        return `export { default } from "${asset}";`
      }
    },






    xxxload(id) {
      if (!filter(id)) {
        return null
      }

      const inputStream = fs.createReadStream(id)

      return new Promise((resolve, reject) => {
        inputStream.on("readable", async() => {
          const fileSource = id
          const fileExt = path.extname(id)
          const fileName = path.basename(id).slice(0, -fileExt.length)
          const destId = await getHashedName(id)

          const fileHash = destId.slice(0, -fileExt.length)
          const destFilename = prependName ? `${fileName}_${destId}` : destId
          const fileDest = path.resolve(outputFolder, destFilename)

          // Mark new file location as external to prevent further processing.
          externalIds[`./${destFilename}`] = true

          const inputFolder = path.dirname(path.resolve(input))
          const relativeToRoot = path
            .relative(path.dirname(fileSource), inputFolder)
            .replace(/\\/g, "/")
          let relativeOutputPath = path.relative(outputBase || outputFolder, outputFolder)
          if (relativeOutputPath) {
            relativeOutputPath += "/"
          }

          // Adjust destId so that it points to the root folder - from any
          // depth we detected inside the original project structure.
          let importId
          if (relativeToRoot.charAt(0) === ".") {
            importId = `${relativeToRoot}/${relativeOutputPath}${destFilename}`
          } else if (relativeToRoot === "") {
            importId = `./${relativeOutputPath}${destFilename}`
          } else {
            importId = `./${relativeToRoot}/${relativeOutputPath}${destFilename}`
          }

          if (fileExt in styleParser) {
            if (verbose) {
              console.log(`Processing ${fileSource} => ${fileDest}...`)
            }

            const fileContent = fs.readFileSync(fileSource)
            return processStyle(fileContent, fileSource, fileDest, prependName).then(() =>
              resolve({
                code: `import _${fileHash} from "${importId}"; export default _${fileHash};`,
                map: { mappings: "" }
              })
            )
          } else {
            if (verbose) {
              console.log(`Copying ${fileSource} => ${fileDest}...`)
            }

            return copyAsync(fileSource, fileDest).then(() =>
              resolve({
                code: `import _${fileHash} from "${importId}"; export default _${fileHash};`,
                map: { mappings: "" }
              })
            )
          }
        })
      })
    }
  }
}
