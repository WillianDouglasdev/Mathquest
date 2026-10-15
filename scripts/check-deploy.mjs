import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

/*
 * O Windows aceita diferenças de maiúsculas em caminhos que o build Linux não
 * aceita. Antes de publicar, conferimos os imports locais, os assets apontados
 * pelo código e as cópias produzidas pelo Vite com a grafia real dos arquivos.
 * Isso não substitui um deploy na Vercel; é uma verificação local de portabilidade.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const files = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)],
)
const relative = file => path.relative(root, file).replaceAll('\\', '/')
const exactFile = file => {
  const parts = path.relative(root, file).split(path.sep)
  if (parts[0] === '..' || path.isAbsolute(parts[0])) return false
  let cursor = root
  for (const part of parts) {
    if (!fs.existsSync(cursor) || !fs.statSync(cursor).isDirectory() || !fs.readdirSync(cursor).includes(part)) return false
    cursor = path.join(cursor, part)
  }
  return fs.statSync(cursor).isFile()
}
// Fixtures de áudio usadas pelos testes não são arquivos publicados da aplicação.
const sources = files(path.join(root, 'src')).filter(file =>
  /\.(tsx?|css)$/.test(file) && !file.includes('.test.') && !file.includes(`${path.sep}test${path.sep}`),
)
let imports = 0
const assets = new Set()
for (const file of sources) {
  const text = fs.readFileSync(file, 'utf8')
  if (/\.tsx?$/.test(file)) {
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
      const specifier = statement.moduleSpecifier.text
      if (!specifier.startsWith('.')) continue
      imports++
      const target = path.resolve(path.dirname(file), specifier)
      const candidates = [target, `${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts'), path.join(target, 'index.tsx')]
      if (!candidates.some(exactFile)) failures.push(`Import ausente ou com grafia diferente: ${relative(file)} → ${specifier}`)
    }
  }
  // Os assets deste MVP usam URLs locais literais; o catálogo de música está vazio.
  for (const match of text.matchAll(/["'`(](\/(?:assets|audio)\/[A-Za-z0-9_./-]+\.(?:png|webp|gif|jpe?g|woff2|mp3|ogg|wav))/g)) assets.add(match[1])
}
for (const url of assets) {
  if (!exactFile(path.join(root, 'public', url.slice(1)))) failures.push(`Asset ausente ou com grafia diferente: ${url}`)
}
const html = path.join(root, 'dist/index.html')
if (!fs.existsSync(html)) failures.push('Build ausente. Execute npm run build primeiro.')
else {
  for (const match of fs.readFileSync(html, 'utf8').matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
    if (!exactFile(path.join(root, 'dist', match[1].slice(1)))) failures.push(`Arquivo referenciado pelo HTML não encontrado: ${match[1]}`)
  }
  for (const file of files(path.join(root, 'public'))) {
    const destination = path.join(root, 'dist', path.relative(path.join(root, 'public'), file))
    const hash = target => crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')
    if (!exactFile(destination) || hash(file) !== hash(destination)) failures.push(`Cópia de asset divergente no build: ${relative(file)}`)
  }
}
const report = { importsChecked: imports, assetUrlsChecked: assets.size, failures }
console.log(JSON.stringify(report, null, 2))
if (failures.length) process.exitCode = 1
