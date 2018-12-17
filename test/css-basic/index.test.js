import { bundle, clean, list, read } from "../util"

const root = __dirname

test("CSS Basic", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(list(root, "output")).resolves.toMatchSnapshot()
  expect(read(root, "output/index.js")).resolves.toMatchSnapshot()
  expect(read(root, "output/KKaZlCcl.css")).resolves.toMatchSnapshot()

  await clean(root, "output")
})
