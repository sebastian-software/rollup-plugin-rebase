import { bundle, clean } from "../util"

test("Flat", async () => {
  const outputFile = `./output/index.js`

  await bundle(__dirname, "flat.js", outputFile)

  // await Promise.all([
  //   expect(fs.pathExists(outputFile)).resolves.toBeTruthy()
  // ])

  // await clean(outputFile)
})
