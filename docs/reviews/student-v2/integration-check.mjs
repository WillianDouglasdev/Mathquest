import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const folder = fileURLToPath(new URL('./', import.meta.url))
const project = fileURLToPath(new URL('../../../', import.meta.url))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'approved-baseline.json'), 'utf8'))
const protectedAssets = Object.entries(baseline)
  .filter(([file]) => file.startsWith('public/assets/'))
  .map(([file, expected]) => ({ file, unchanged: hash(path.join(project, file)) === expected }))
const pairs = [
  ['full-body-candidate.png', 'student-v2-full.png'],
  ['navigation-portrait-candidate.png', 'student-v2-navigation.png'],
  ['ranking-avatar-candidate.png', 'student-v2-ranking.png'],
]
const integratedAssets = pairs.map(([candidate, filename]) => {
  const file = `public/assets/characters/${filename}`
  const data = fs.readFileSync(path.join(project, file))
  const buildFile = path.join(project, 'dist/assets/characters', filename)
  return {
    file,
    matchesApprovedCandidate: hash(path.join(folder, candidate)) === hash(path.join(project, file)),
    buildMatches: fs.existsSync(buildFile) && hash(buildFile) === hash(path.join(project, file)),
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
    pngColorType: data[25],
    sha256: hash(path.join(project, file)),
  }
})
const report = { protectedAssets, integratedAssets }
fs.writeFileSync(path.join(folder, 'integration-assets.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (protectedAssets.some(asset => !asset.unchanged) || integratedAssets.some(asset => !asset.matchesApprovedCandidate || !asset.buildMatches)) {
  process.exitCode = 1
}
