import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const folder = fileURLToPath(new URL('./', import.meta.url))
const root = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'baseline.json'), 'utf8'))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')
const protectedFile = file => file.startsWith('public/assets/') || file.startsWith('src/domain/') || file.startsWith('src/services/focus/') || file.startsWith('src/services/review/') || file.startsWith('src/data/') || file.includes('.test.') || file === 'package.json' || file === 'package-lock.json' || file.startsWith('src/components/StudentAvatar') || file === 'src/features/focus/FocusProvider.tsx'
const changed = Object.keys(baseline).filter(file => hash(file) !== baseline[file])
const unexpected = changed.filter(protectedFile)
const report = {
  baselineFiles: Object.keys(baseline).length,
  changed,
  unexpected,
  approvedAssetsPreserved: !unexpected.some(f => f.startsWith('public/assets/')),
  approvedAssetCount: Object.keys(baseline).filter(f => f.startsWith('public/assets/')).length,
  educationalRulesAndExistingTestsPreserved: unexpected.length === 0,
  dependenciesPreserved: !changed.includes('package.json') && !changed.includes('package-lock.json'),
  note: 'Integrações autorizadas de apresentação, preferências e sons nos componentes; motores, stores de progresso, dados, provider de foco, testes anteriores e assets aprovados preservados.',
}
fs.writeFileSync(path.join(folder, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (unexpected.length) process.exitCode = 1
