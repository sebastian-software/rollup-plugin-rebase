import fs from "fs"
import path from "path"
import crypto from "crypto"
import denodeify from "denodeify"
import fse from "fs-extra"
import { getHashDigest } from "loader-utils"

import postcss from "postcss"
import postcssSmartImport from "postcss-smart-import"
import postcssParserSugarss from "sugarss"
import postcssParserScss from "postcss-scss"

var copyAsync = denodeify(fse.copy)
var writeAsync = denodeify(fse.outputFile)

function isAssetFile(id)
{
  var fileExt = path.extname(id).slice(1)
  return !(fileExt === "" || (/^(json|jsx|js|es|es5|es6)$/).exec(fileExt))
}

const styleExtensions =
{
  ".css": null,
  ".sss": postcssParserSugarss,
  ".scss": postcssParserScss
}

const postcssPlugins = [
  postcssSmartImport()
]

function processStyle(code, id, dest)
{
  var parser = styleExtensions[path.extname(id)]
  return postcss(postcssPlugins)
    .process(code,
    {
      from: id,
      to: dest,
      parser: parser,
      extensions: [ ".css", ".sss", ".scss" ]
    })
    .then((result) => {
      return writeAsync(dest, result)
    })
    .catch((err) => {
      console.error(err)
    })
}

const hashType = "sha256"
const digestType = "base62"
const digestLength = 8

const externalIds = {}


export default function(outputFolder)
{
  return {
    name: "file-loader",

    isExternal: function(id)
    {
      var baseName = "./" + path.basename(id)
      return baseName in externalIds
    },

    resolveId: function(importee)
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

    load: function(id)
    {
      if (!isAssetFile(id))
        return null

      const input = fs.createReadStream(id)
      const hash = crypto.createHash("sha256")

      return new Promise((resolve, reject) =>
      {
        input.on("readable", () =>
        {
          var fileSource = id
          var fileContent = fs.readFileSync(fileSource)
          var fileExt = path.extname(id)
          var fileHash = getHashDigest(fileContent, hashType, digestType, digestLength)

          var destExt = fileExt in styleExtensions ? ".css" : fileExt
          var destId = path.basename(id, fileExt) + "-" + fileHash + destExt

          var fileDest = path.join(outputFolder, destId)

          externalIds["./" + destId] = true

          if (fileExt in styleExtensions)
          {
            return processStyle(fileContent, fileSource, fileDest).then(function()
            {
              resolve({
                code: `import _${fileHash} from "./${destId}"; export default _${fileHash};`,
                map: { mappings: "" }
              })
            })
          }
          else
          {
            return copyAsync(fileSource, fileDest).then(function()
            {
              resolve({
                code: `import _${fileHash} from "./${destId}"; export default _${fileHash};`,
                map: { mappings: "" }
              })
            })
          }
        })
      })
    }
  }
}
