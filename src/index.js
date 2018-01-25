/* eslint-disable filenames/match-exported */
import path from "path"
import denodeify from "denodeify"
import fs from "fs-extra"
import { createFilter } from "rollup-pluginutils"
import { getHashedName } from "asset-hash"

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

function getPostCssPlugins(prependName) {
  return [ postcssImport(), postcssSmartAsset({
    url: "copy",
    useHash: true,
    prependName
  }) ]
}

/* eslint-disable max-params */
function processStyle(code, id, dest, prependName) {
  var parser = styleParser[path.extname(id)]
  return postcss(getPostCssPlugins(prependName))
    .process(code.toString(), {
      from: id,
      to: dest,
      extensions: Object.keys(styleParser),
      map: { inline: true },

      // Always uses parser... even for scss as we like to offer "normal" CSS in deployed files.
      parser
    })
    .then((result) => writeAsync(dest, result))
    .catch((error) => {
      console.error(error)
    })
}

const externalIds = {}

const defaultExclude = [ "**/*.json", "**/*.mjs", "**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx", "**/*.vue" ]

export default function rebase(options = {}) {
  const { include, exclude = defaultExclude, input, outputFolder, outputBase, verbose, prependName } = options
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

      const inputStream = fs.createReadStream(id)

      return new Promise((resolve, reject) => {
        inputStream.on("readable", async() => {
          var fileSource = id
          var fileExt = path.extname(id)
          var fileName = path.basename(id).slice(0, -fileExt.length)
          var destId = await getHashedName(id)


          var fileHash = destId.slice(0, -fileExt.length)
          var destFilename = prependName ? `${fileName}_${destId}` : destId
          var fileDest = path.resolve(outputFolder, destFilename)

          // Mark new file location as external to prevent further processing.
          externalIds[`./${destFilename}`] = true

          var inputFolder = path.dirname(path.resolve(input))
          var relativeToRoot = path.relative(path.dirname(fileSource), inputFolder).replace(/\\/g, "/")
          var relativeOutputPath = path.relative(outputBase || outputFolder, outputFolder);
          if(relativeOutputPath){
            relativeOutputPath += '/';
          }

          // Adjust destId so that it points to the root folder - from any
          // depth we detected inside the original project structure.
          var importId
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

            var fileContent = fs.readFileSync(fileSource)
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
