import { bundle, clean, list, read } from "../util"

const root = "test/flat-single-non-absolute"

test("Flat Single Non Absolute", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()

  await clean(root, "output")
})
