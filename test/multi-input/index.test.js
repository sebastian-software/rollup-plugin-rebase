import { bundleWithMultiInput, clean, list, read } from "../util"
import { join, sep } from "path"

const root = __dirname

test("Multi input support", async () => {
  await bundleWithMultiInput(root, ['src/**/!(*.test).js'], "output", {}, {
    transformOutputPath: (output) => {
      // Need to transform output as bundle path starts from root of project
      return output.replace(`${join('test', 'multi-input', 'src')}${sep}`, '');
    },
  })

  expect(await list(root, "output")).toMatchSnapshot()
  expect(await read(root, "output/index.js")).toMatchSnapshot()
  expect(await read(root, "output/sub/folder/child.js")).toMatchSnapshot()

  await clean(root, "output")
})
