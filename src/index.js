/* eslint-disable filenames/match-exported */
import path from "path"
import denodeify from "denodeify"
import fs from "fs-extra"
import { getHashDigest } from "loader-utils"
import { createFilter } from "rollup-pluginutils"

import postcss from "postcss"
import postcssSmartImport from "postcss-smart-import"
import postcssSimpleUrl from "postcss-simple-url"
import postcssParserSugarss from "sugarss"
import postcssParserScss from "postcss-scss"

var copyAsync = denodeify(fs.copy)
var writeAsync = denodeify(fs.outputFile)

const styleExtensions = {
  ".css": null,
  ".sss": postcssParserSugarss,
  ".scss": postcssParserScss
}

const postcssPlugins = [
  postcssSmartImport(),
  postcssSimpleUrl()
]

function processStyle(code, id, dest)
{
  var parser = styleExtensions[path.extname(id)]
  return postcss(postcssPlugins)
    .process(code,
    {
      from: id,
      to: dest,
      parser,
      extensions: [ ".css", ".sss", ".scss" ]
    })
    .then((result) =>
       writeAsync(dest, result)
    )
    .catch((err) => {
      console.error(err)
    })
}

const hashType = "sha256"
const digestType = "base62"
const digestLength = 8

const externalIds = {}

const defaultExclude = [
  "**/*.json",
  "**/*.js",
  "**/*.jsx",
  "**/*.ts",
  "**/*.tsx",
  "**/*.vue"
]

export default function rebase(options = {})
{
  const { include, exclude = defaultExclude, entry, outputFolder, verbose } = options
  const filter = createFilter(include, exclude)

  return {
    name: "rollup-plugin-rebase",

    isExternal(id)
    {
      var baseName = `./${path.basename(id)}`
      return baseName in externalIds
    },

    resolveId(importee)
    {
      if (importee in externalIds)
      {
        // This does not yet seem to work!
        // See also: https://github.com/rollup/rollup/issues/861
        // "returning any other falsy value signals that importee should be treated as an external module
        // and not included in the bundle." -- https://github.com/rollup/rollup/wiki/Plugins#creating-plugins
        return false
      }

      return null
    },

    load(id)
    {
      if (!filter(id)) {
        return null
      }

      const input = fs.createReadStream(id)

      return new Promise((resolve, reject) =>
      {
        input.on("readable", () =>
        {
          var fileSource = id
          var fileContent = fs.readFileSync(fileSource)
          var fileExt = path.extname(id)
          var fileHash = getHashDigest(fileContent, hashType, digestType, digestLength)

          var destExt = fileExt in styleExtensions ? ".css" : fileExt
          var destId = `${path.basename(id, fileExt)}-${fileHash}${destExt}`

          var fileDest = path.resolve(outputFolder, destId)

          // Mark new file location as external to prevent further processing.
          externalIds[`./${destId}`] = true

          var entryFolder = path.dirname(path.resolve(entry))
          var relativeToRoot = path.relative(path.dirname(fileSource), entryFolder).replace(/\\/g, "/")

          // Adjust destId so that it points to the root folder - from any
          // depth we detected inside the original project structure.
          if (relativeToRoot.charAt(0) === ".") {
            var importId = `${relativeToRoot}/${destId}`
          } else if (relativeToRoot === "") {
            var importId = `./${destId}`
          } else {
            var importId = `./${relativeToRoot}/${destId}`
          }

          if (fileExt in styleExtensions)
          {
            if (verbose) {
              console.log(`Processing ${fileSource} => ${fileDest}...`)
            }

            return processStyle(fileContent, fileSource, fileDest).then(() =>
            {
              resolve({
                code: `import _${fileHash} from "${importId}"; export default _${fileHash};`,
                map: { mappings: "" }
              })
            })
          }
          else
          {
            if (verbose) {
              console.log(`Copying ${fileSource} => ${fileDest}...`)
            }

            return copyAsync(fileSource, fileDest).then(() =>
            {
              resolve({
                code: `import _${fileHash} from "${importId}"; export default _${fileHash};`,
                map: { mappings: "" }
              })
            })
          }
        })
      })
    }
  }
}
