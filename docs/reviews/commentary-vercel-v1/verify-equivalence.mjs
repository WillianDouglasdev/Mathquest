import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import postcss from 'postcss'

/*
 * Comentários devem melhorar a leitura sem alterar o aplicativo. Esta conferência
 * compara o JavaScript emitido sem comentários e a estrutura das regras CSS com
 * o retrato anterior à edição. Ela complementa, mas não substitui, testes e build.
 */
const directory = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(directory, '../../..')
const baseline = JSON.parse(fs.readFileSync(path.join(directory, 'baseline.json'), 'utf8'))
const read = relative => fs.readFileSync(path.join(root, relative))
const hash = value => crypto.createHash('sha256').update(value).digest('hex')
const cssShape = root => root.nodes?.filter(node => node.type !== 'comment').map(node => ({
  type: node.type, selector: node.selector, prop: node.prop, value: node.value,
  important: node.important, name: node.name, params: node.params, nodes: cssShape(node),
}))
const runtimeDifferences = Object.entries(baseline.runtime).filter(([file, before]) => {
  const emitted = ts.transpileModule(read(file).toString('utf8'), {
    fileName: file,
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022, removeComments: true,
    },
  }).outputText
  return hash(emitted) !== before
}).map(([file]) => file)
const styleDifferences = Object.entries(baseline.styles).filter(([file, before]) =>
  hash(JSON.stringify(cssShape(postcss.parse(read(file).toString('utf8'))))) !== before,
).map(([file]) => file)
const assetDifferences = Object.entries(baseline.files).filter(([file, before]) =>
  (file.startsWith('public/') || file.startsWith('art/')) && hash(read(file)) !== before,
).map(([file]) => file)
const commentedFiles = Object.entries(baseline.files).filter(([file, before]) =>
  file.startsWith('src/') && hash(read(file)) !== before,
).map(([file]) => file)
const result = {
  javascriptModulesChecked: Object.keys(baseline.runtime).length,
  stylesheetsChecked: Object.keys(baseline.styles).length,
  commentedFiles, runtimeDifferences, styleDifferences, assetDifferences,
}
fs.writeFileSync(path.join(directory, 'equivalence.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ ...result, commentedFiles: commentedFiles.length }, null, 2))
if (runtimeDifferences.length || styleDifferences.length || assetDifferences.length) process.exitCode = 1
