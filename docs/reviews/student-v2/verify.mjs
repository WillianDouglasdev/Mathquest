import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const folder = fileURLToPath(new URL('./', import.meta.url))
const project = fileURLToPath(new URL('../../../', import.meta.url))
const baseline = JSON.parse(fs.readFileSync(path.join(folder, 'approved-baseline.json'), 'utf8'))
const changed = Object.entries(baseline).filter(([file, hash]) => {
  const target = path.join(project, file)
  return !fs.existsSync(target) || crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex') !== hash
}).map(([file]) => file)

let checked = 0
const broken = []
for (const file of fs.readdirSync(folder).filter(file => /\.(html|md)$/.test(file))) {
  const content = fs.readFileSync(path.join(folder, file), 'utf8')
  const links = file.endsWith('.html')
    ? [...content.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1])
    : [...content.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1])
  for (const link of links) {
    const target = link.split('#')[0]
    if (!target || /^[a-z]+:/i.test(target)) continue
    checked++
    if (!fs.existsSync(path.resolve(folder, decodeURIComponent(target)))) broken.push({ file, link })
  }
}

const images = fs.readdirSync(folder).filter(file => file.endsWith('.png')).map(file => {
  const png = fs.readFileSync(path.join(folder, file))
  return { file, width: png.readUInt32BE(16), height: png.readUInt32BE(20), pngColorType: png[25] }
})
const report = {
  preservedFiles: Object.keys(baseline).length,
  changed,
  images,
  localLinks: { checked, broken },
  transparency: 'Canto superior esquerdo dos três PNGs verificado com System.Drawing: alpha 0.',
  visualInspection: 'Saídas da geração inspecionadas: cabelo, rosto, paleta e roupa consistentes; aprovação do usuário pendente.',
  pending: ['Validação visual do usuário', 'Legibilidade no navegador em tamanhos reais', 'Integração somente após aprovação'],
}
fs.writeFileSync(path.join(folder, 'verification.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
if (changed.length || broken.length || images.length !== 3) process.exitCode = 1
