import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const folder = fileURLToPath(new URL('./', import.meta.url))
const root = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'baseline.json'), 'utf8'))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')
const changed = Object.keys(baseline).filter(file => hash(file) !== baseline[file])
const allowed = ['src/components/StudentAvatar.tsx', 'src/features/experience/ExperienceProvider.tsx', 'src/features/dashboard/Dashboard.tsx', 'src/features/focus/FocusPage.tsx', 'src/app/App.tsx', 'src/test/dashboard.test.tsx']
const unexpected = changed.filter(file => !allowed.includes(file))
const runtime = [...fs.readFileSync(path.join(root, 'src/components/StudentAvatar.tsx'), 'utf8').matchAll(/'\/assets\/animations\/characters\/([^']+)'/g)].map(match => match[1])
const copies = runtime.map(file => ({ file, sourceIdentical: hash(`art/characters/${file}`) === hash(`public/assets/animations/characters/${file}`), buildIdentical: hash(`public/assets/animations/characters/${file}`) === hash(`dist/assets/animations/characters/${file}`), bytes: fs.statSync(path.join(root, 'public/assets/animations/characters', file)).size }))
const sourceFiles = Object.keys(baseline).filter(file => /^(art|characters|previews)\//.test(file))
const originalAssets = Object.keys(baseline).filter(file => file.startsWith('public/assets/'))
const report = {
  baselineFiles: Object.keys(baseline).length, changed, unexpected,
  approvedAssetsPreserved: originalAssets.every(file => hash(file) === baseline[file]), approvedAssetCount: originalAssets.length,
  allPackageSourcesPreserved: sourceFiles.every(file => hash(file) === baseline[file]), sourceFileCount: sourceFiles.length,
  runtimeCopies: copies, totalRuntimeBytes: copies.reduce((sum, copy) => sum + copy.bytes, 0),
  note: 'PNGs originais e fontes intactos; cópias runtime idênticas a art/. Um teste de apresentação do Dashboard foi atualizado para URLs/dimensões compactas; comportamento educacional preservado.',
}
fs.writeFileSync(path.join(folder, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (unexpected.length || !report.approvedAssetsPreserved || !report.allPackageSourcesPreserved || copies.some(copy => !copy.sourceIdentical || !copy.buildIdentical)) process.exitCode = 1
