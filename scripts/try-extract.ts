import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { checkExtraction } from "@/lib/import/checks"
import { extractScorecard } from "@/lib/import/extract"

async function main() {
  const folder = process.argv[2]
  if (!folder) throw new Error("Usage: try-extract <folder>")

  const files = readdirSync(folder)
    .filter((file) => /\.(jpe?g|png)$/i.test(file))
    .sort()

  const images = files.map((file) => ({
    mimeType: file.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg",
    data: readFileSync(path.join(folder, file)).toString("base64"),
  }))

  console.log(`Sending ${files.length} screenshots to Gemini...`)

  const { data, modelUsed, seconds } = await extractScorecard(images)
  console.log(`Answered by ${modelUsed} in ${seconds.toFixed(1)}s`)
  console.log(JSON.stringify(data, null, 2))

  const warnings = checkExtraction(data)
  if (warnings.length === 0) {
    console.log("✓ All checks passed")
  } else {
    console.log(`${warnings.length} warning(s):`)
    for (const warning of warnings) {
      console.log(`  [innings ${warning.innings}] ${warning.code}: ${warning.message}`)
    }
  }

  if (data.unreadable.length > 0) {
    console.log("Unreadable:")
    for (const item of data.unreadable) {
      console.log(`  - ${item}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
