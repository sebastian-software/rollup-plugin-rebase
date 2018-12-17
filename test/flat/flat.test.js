/* global __dirname */
import { bundle, clean, exists } from "../util"

const root = __dirname

test("Flat", async () => {
  const output = "output/index.js"

  await bundle(root, "flat.js", output)

  expect(exists(root,
    [
      output,
      "output/bsdudxaF.md"
    ])).resolves.toBeTruthy()

  await clean(root, output)
})
