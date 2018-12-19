import { bundle, clean, list, read } from "../util"

const root = __dirname

function formatConsoleMock(fn) {
  return fn.mock.calls
    .map((entry) => {
      return entry.join(" ")
    })
    .join("\n")
    // Windows support
    .replace("\\\\", "/")
}

test("CSS Asset Verbose", async () => {
  console.log = jest.fn()
  await bundle(root, "index.js", "output/index.js", { verbose: true })
  expect(formatConsoleMock(console.log)).toMatchSnapshot()

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/gToHHcDx.css")).toMatchSnapshot()

  await clean(root, "output")
})
