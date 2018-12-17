/* global __dirname */
import { bundle, clean, list } from "../util"

const root = __dirname

test("Flat Single", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(list(root, "output")).resolves.toMatchSnapshot()

  await clean(root, "output")
})
