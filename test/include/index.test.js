import { bundle, clean, list, read } from "../util"

const root = __dirname

test.only("Include", async () => {
  await bundle(root, "index.js", "output/index.js", { include: ["**/*.css", "**/*.md"] })

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/cGxRTWKw.css")).toMatchSnapshot()

  await clean(root, "output")
})
