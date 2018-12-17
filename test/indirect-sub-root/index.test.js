import { bundle, clean, list, read } from "../util"

const root = __dirname

test("Indirect Sub Root", async () => {
  await bundle(root, "src/index.js", "output/index.js")

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()

  await clean(root, "output")
})
