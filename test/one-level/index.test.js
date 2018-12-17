/* global __dirname */
import { bundle, clean, exists } from "../util"

const root = __dirname

test("One Level", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(exists(root,
    [
      "output/index.js",
      "output/bsdudxaF.md"
    ])).resolves.toBeTruthy()

  await clean(root, "output")
})
