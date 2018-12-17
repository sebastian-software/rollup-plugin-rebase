import { bundle, clean, list, read } from "../util"

const root = __dirname

test("Keep Name", async () => {
  await bundle(root, "index.js", "output/index.js", { keepName: true })

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/index~gToHHcDx.css")).toMatchSnapshot()

  await clean(root, "output")
})
