import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const folder = fileURLToPath(new URL('./', import.meta.url))
const root = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'baseline.json'), 'utf8'))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')
const allowed = ['src/app/App.tsx', 'src/test/dashboard.test.tsx']
const changed = Object.keys(baseline).filter(file => !fs.existsSync(path.join(root, file)) || hash(file) !== baseline[file])
const assets = Object.keys(baseline).filter(file => file.startsWith('public/assets/'))
const source = 'art/Mapa_test.png'
const published = 'public/assets/maps/mathquest-world.png'
const report = {
  baselineFiles: Object.keys(baseline).length,
  changed,
  unexpected: changed.filter(file => !allowed.includes(file)),
  existingAssetsPreserved: assets.every(file => hash(file) === baseline[file]),
  existingAssetCount: assets.length,
  existingBuildAssetsIdentical: assets.every(file => hash(file) === hash(file.replace('public/', 'dist/'))),
  protectedFilesPreserved: Object.keys(baseline).filter(file => !allowed.includes(file)).every(file => hash(file) === baseline[file]),
  map: { source, published, bytes: fs.statSync(path.join(root, source)).size,
    sha256: hash(source), sourcePreserved: hash(source) === baseline[source],
    runtimeIdentical: hash(source) === hash(published), buildIdentical: hash(source) === hash(published.replace('public/', 'dist/')) },
  dependenciesPreserved: ['package.json', 'package-lock.json'].every(file => hash(file) === baseline[file]),
}
fs.writeFileSync(path.join(folder, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (report.unexpected.length || !report.protectedFilesPreserved || !report.existingAssetsPreserved || !report.existingBuildAssetsIdentical || !report.map.sourcePreserved || !report.map.runtimeIdentical || !report.map.buildIdentical || !report.dependenciesPreserved) process.exitCode = 1
