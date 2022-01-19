import { bundle, clean, list, read } from "../util"

const root = __dirname

test("Sugar SS Asset", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/yaFSUYWG.pcss")).toMatchSnapshot()

  await clean(root, "output")
})
