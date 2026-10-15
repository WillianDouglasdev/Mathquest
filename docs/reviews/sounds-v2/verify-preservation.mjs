import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const folder = fileURLToPath(new URL('./', import.meta.url))
const root = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'baseline.json'), 'utf8'))
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex')
const adaptedTests = ['src/services/experience/PreferencesStore.test.ts', 'src/test/focus-mode.test.tsx']
const protectedFile = file => file.startsWith('public/assets/') || file.startsWith('src/domain/') || file.startsWith('src/services/focus/') || file.startsWith('src/services/review/') || file.startsWith('src/data/') || (file.includes('.test.') && !adaptedTests.includes(file)) || ['package.json', 'package-lock.json', 'src/features/focus/FocusProvider.tsx'].includes(file) || file.startsWith('src/components/StudentAvatar')
const changed = Object.keys(baseline).filter(file => hash(file) !== baseline[file])
const unexpected = changed.filter(protectedFile)
const report = {
  baselineFiles: Object.keys(baseline).length, changed, unexpected,
  approvedAssetsPreserved: !unexpected.some(f => f.startsWith('public/assets/')),
  approvedAssetCount: Object.keys(baseline).filter(f => f.startsWith('public/assets/')).length,
  educationalRulesAndDataPreserved: !unexpected.length,
  adaptedTests: changed.filter(f => adaptedTests.includes(f)),
  dependenciesPreserved: !changed.some(f => f === 'package.json' || f === 'package-lock.json'),
  note: 'Testes adaptados para efeitos ligados por padrão e som de abertura após interação; carregamento continua silencioso. Motores, progresso, dados, assets e demais testes preservados.',
}
fs.writeFileSync(path.join(folder, 'preservation.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (unexpected.length) process.exitCode = 1
