/* eslint-disable filenames/match-exported */
import path from "path"
import denodeify from "denodeify"
import fs from "fs-extra"
import { getHashDigest } from "loader-utils"
import { createFilter } from "rollup-pluginutils"

import postcss from "postcss"

import postcssImport from "postcss-import"
import postcssSmartAsset from "postcss-smart-asset"

import postcssSugarSS from "sugarss"
import postcssScss from "postcss-scss"
import postcssSass from "postcss-sass"

var copyAsync = denodeify(fs.copy)
var writeAsync = denodeify(fs.outputFile)

const styleParser = {
  ".pcss": null,
  ".css": null,
  ".sss": postcssSugarSS,
  ".scss": postcssScss,
  ".sass": postcssSass
}

const postcssPlugins = [ postcssImport(), postcssSmartAsset() ]

function processStyle(code, id, dest) {
  var parser = styleParser[path.extname(id)]
  return postcss(postcssPlugins)
    .process(code.toString(), {
      from: id,
      to: dest,
      extensions: [ ".pcss", ".css", ".sss", ".scss", ".sass" ],

      // Always uses parser... even for scss as we like to offer "normal" CSS in deployed files.
      parser
    })
    .then((result) => writeAsync(dest, result))
    .catch((error) => {
      console.error(error)
    })
}

const hashType = "sha256"
const digestType = "base62"
const digestLength = 8

const externalIds = {}

const defaultExclude = [ "**/*.json", "**/*.mjs", "**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx", "**/*.vue" ]

export default function rebase(options = {}) {
  const { include, exclude = defaultExclude, entry, outputFolder, verbose } = options
  const filter = createFilter(include, exclude)

  return {
    name: "rollup-plugin-rebase",

    isExternal(id) {
      var baseName = `./${path.basename(id)}`
      return baseName in externalIds
    },

    resolveId(importee) {
      if (importee in externalIds) {
        // This does not yet seem to work!
        // See also: https://github.com/rollup/rollup/issues/861
        // "returning any other falsy value signals that importee should be treated as an external module
        // and not included in the bundle." -- https://github.com/rollup/rollup/wiki/Plugins#creating-plugins
        return false
      }

      return null
    },

    load(id) {
      if (!filter(id)) {
        return null
      }

      const input = fs.createReadStream(id)

      return new Promise((resolve, reject) => {
        input.on("readable", () => {
          var fileSource = id
          var fileContent = fs.readFileSync(fileSource)
          var fileExt = path.extname(id)
          var fileHash = getHashDigest(fileContent, hashType, digestType, digestLength)

          var destExt = fileExt in styleParser ? ".css" : fileExt
          var destId = `${path.basename(id, fileExt)}-${fileHash}${destExt}`

          var fileDest = path.resolve(outputFolder, destId)

          // Mark new file location as external to prevent further processing.
          externalIds[`./${destId}`] = true

          var entryFolder = path.dirname(path.resolve(entry))
          var relativeToRoot = path.relative(path.dirname(fileSource), entryFolder).replace(/\\/g, "/")

          // Adjust destId so that it points to the root folder - from any
          // depth we detected inside the original project structure.
          var importId
          if (relativeToRoot.charAt(0) === ".") {
            importId = `${relativeToRoot}/${destId}`
          } else if (relativeToRoot === "") {
            importId = `./${destId}`
          } else {
            importId = `./${relativeToRoot}/${destId}`
          }

          if (fileExt in styleParser) {
            if (verbose) {
              console.log(`Processing ${fileSource} => ${fileDest}...`)
            }

            return processStyle(fileContent, fileSource, fileDest).then(() =>
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
