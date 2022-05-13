import { bundle, clean, list, read } from "../util"

const root = __dirname

test("Skip hash", async () => {
  await bundle(root, "index.js", "output/index.js", {
    skipHash: true,
  })

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()

  await clean(root, "output")
})
