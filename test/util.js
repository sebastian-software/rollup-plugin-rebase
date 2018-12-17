import { join } from "path"

import fs from "fs-extra"
import { rollup } from "rollup"

import rebasePlugin from "../src"

export async function bundle(root, input, output, pluginOptions = {}) {
  const plugin = rebasePlugin(pluginOptions)

  const result = await rollup({
    input: join(root, input),
    plugins: [ plugin ]
  })

  await result.write({
    format: "es",
    file: join(root, output)
  })
}

export async function clean(files) {
  const tasks = files.map((file) => fs.remove(file))
  return Promise.all(tasks)
}
