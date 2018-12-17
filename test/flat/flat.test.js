/* global __dirname */
import { bundle, clean, exists } from "../util"

const root = __dirname

test("Flat", async () => {
  await bundle(root, "flat.js", "output/index.js")

  expect(exists(root,
    [
      "output/index.js",
      "output/bsdudxaF.md"
    ])).resolves.toBeTruthy()

  await clean(root, "output")
})
