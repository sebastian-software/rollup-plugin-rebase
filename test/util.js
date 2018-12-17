import fs from "fs-extra"
import { rollup } from "rollup"

import rebasePlugin from "../src"

export async function bundle(input, outputFile, pluginOptions = {}) {
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

export async function clean(files) {
  const tasks = files.map((file) => fs.remove(file))
  return Promise.all(tasks)
}
