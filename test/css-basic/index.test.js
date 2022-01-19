import { bundle, clean, list, read } from "../util"

const root = __dirname

test("CSS Basic", async () => {
  await bundle(root, "index.js", "output/index.js")

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/SDZkqFGT.css")).toMatchSnapshot()

  await clean(root, "output")
})
