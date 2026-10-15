import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const folder = fileURLToPath(new URL('./', import.meta.url))
const root = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'baseline.json'), 'utf8'))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')
const allowed = ['src/app/App.tsx', 'src/app/App.module.css', 'src/features/experience/motion.css', 'src/features/dashboard/Dashboard.tsx']
const changed = Object.keys(baseline).filter(file => !fs.existsSync(path.join(root, file)) || hash(file) !== baseline[file])
const assets = Object.keys(baseline).filter(file => file.startsWith('public/assets/'))
const sources = Object.keys(baseline).filter(file => /^(art|characters|previews)\//.test(file))
const protectedFiles = Object.keys(baseline).filter(file => !allowed.includes(file))
const report = {
  baselineFiles: Object.keys(baseline).length,
  changed,
  unexpected: changed.filter(file => !allowed.includes(file)),
  protectedFilesPreserved: protectedFiles.every(file => !changed.includes(file)),
  assetCount: assets.length,
  approvedAssetsPreserved: assets.every(file => hash(file) === baseline[file]),
  buildAssetsIdentical: assets.every(file => hash(file) === hash(file.replace('public/', 'dist/'))),
  sourceFilesPreserved: sources.every(file => hash(file) === baseline[file]),
  dependenciesPreserved: ['package.json', 'package-lock.json'].every(file => hash(file) === baseline[file]),
}
fs.writeFileSync(path.join(folder, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (report.unexpected.length || !report.protectedFilesPreserved || !report.approvedAssetsPreserved || !report.buildAssetsIdentical || !report.sourceFilesPreserved || !report.dependenciesPreserved) process.exitCode = 1
