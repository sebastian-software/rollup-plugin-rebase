/* global __dirname */
import { bundle, clean, exists, list } from "../util"

const root = __dirname

test("Flat", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(list(root, "output")).resolves.toMatchSnapshot()

  expect(exists(root,
    [
      "output/index.js",
      "output/bsdudxaF.md"
    ])).resolves.toBeTruthy()

  await clean(root, "output")
})
