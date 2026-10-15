import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const folder = fileURLToPath(new URL('./', import.meta.url))
const project = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'baseline.json'), 'utf8'))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
const changed = Object.entries(baseline).filter(([file, expected]) => hash(path.join(project, file)) !== expected).map(([file]) => file)
const allowedCompositionChange = 'src/features/focus/FocusPage.tsx'
const unexpected = changed.filter(file => file !== allowedCompositionChange)
const assets = Object.keys(baseline).filter(file => file.startsWith('public/assets/'))
const report = {
  baselineFiles: Object.keys(baseline).length,
  unchangedFiles: Object.keys(baseline).length - changed.length,
  changed,
  unexpected,
  approvedAssetsPreserved: assets.every(file => hash(path.join(project, file)) === baseline[file]),
  approvedAssetCount: assets.length,
  compositionNote: 'FocusPage recebe somente import/render de FlashcardSection e atualização do texto que anunciava a entrega futura. Motor, provider, store, CSS e testes do Pomodoro permanecem intactos.',
}
fs.writeFileSync(path.join(folder, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (unexpected.length || !report.approvedAssetsPreserved) process.exitCode = 1
