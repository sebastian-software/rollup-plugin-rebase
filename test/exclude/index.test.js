import { bundle, clean, list, read } from "../util"

const root = __dirname

test.only("Exclude", async () => {
  await bundle(root, "index.js", "output/index.js", { exclude: ["**/*.png"] })

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/cGxRTWKw.css")).toMatchSnapshot()

  await clean(root, "output")
})
