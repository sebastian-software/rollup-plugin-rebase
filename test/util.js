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

export async function clean(root, files) {
  const input = files instanceof Array ? files : [ files ]
  const tasks = input.map((file) => fs.remove(join(root, file)))
  return Promise.all(tasks)
}

export async function exists(root, files) {
  const input = files instanceof Array ? files : [ files ]
  const tasks = input.map((file) => fs.pathExists(join(root, file)))
  const result = await Promise.all(tasks)
  return !result.some((value) => value === false)
}
