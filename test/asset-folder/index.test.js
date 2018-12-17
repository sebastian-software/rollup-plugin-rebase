import { bundle, clean, list, read } from "../util"

const root = __dirname

test("Asset Folder", async () => {
  await bundle(root, "index.js", "output/index.js", { folder: "bundled-assets" })

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await list(root, "output/bundled-assets")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/bundled-assets/gToHHcDx.css")).toMatchSnapshot()

  await clean(root, "output")
})
