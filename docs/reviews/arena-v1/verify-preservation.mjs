import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '../../..')
const absolute = relative => path.join(root, relative)
const sha256 = relative => crypto.createHash('sha256').update(fs.readFileSync(absolute(relative))).digest('hex')
const baseline = JSON.parse(fs.readFileSync(path.join(directory, 'baseline.json'), 'utf8')).files
const allowed = new Set(['src/app/App.tsx', 'README.md'])
const changed = [], unexpectedChanges = []
for (const [relative, before] of Object.entries(baseline)) {
  const exists = fs.existsSync(absolute(relative))
  if (!exists || sha256(relative) !== before) {
    changed.push(relative)
    if (!exists || !allowed.has(relative)) unexpectedChanges.push(relative)
  }
}
const assetFiles = [
  'background/arena-forest-ruins.png',
  ...['idle', 'attack', 'damage', 'defeated'].map(state => `guardian/guardian-${state}.png`),
]
const assets = assetFiles.map(relative => {
  const source = `art/assets/${relative}`
  const runtime = `public/assets/arena/${relative}`
  const build = `dist/assets/arena/${relative}`
  const buffer = fs.readFileSync(absolute(source))
  const sha = sha256(source)
  return { source, runtime, build, bytes: buffer.length,
    width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20),
    color: buffer[25] === 6 ? 'RGBA' : 'RGB', sha256: sha,
    runtimeIdentical: sha256(runtime) === sha, buildIdentical: sha256(build) === sha }
})
const report = {
  baselineFiles: Object.keys(baseline).length,
  changed, unexpectedChanges,
  originalArtPreserved: Object.keys(baseline).filter(relative => relative.startsWith('art/')).every(relative => sha256(relative) === baseline[relative]),
  previousRuntimeAssetsPreserved: Object.keys(baseline).filter(relative => relative.startsWith('public/')).every(relative => sha256(relative) === baseline[relative]),
  previousTestsPreserved: Object.keys(baseline).filter(relative => /\.test\.tsx?$/.test(relative)).every(relative => sha256(relative) === baseline[relative]),
  assets,
}
fs.writeFileSync(path.join(directory, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
if (unexpectedChanges.length || assets.some(asset => !asset.runtimeIdentical || !asset.buildIdentical)) process.exitCode = 1
console.log(JSON.stringify(report, null, 2))
