import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';

const BASE = 'https://defcoms.eu';
const ROOT = 'src/content/pages';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

const parse = (file) => {
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  try { return yaml.parse(m[1]); } catch { return null; }
};

const titleOf = (d, file) => (d?.title ?? path.basename(file, '.html')).replace(/\s*\|\s*DefComs$/, '');
const descOf = (d) => d?.description ?? d?.ogDescription ?? '';

const pages = walk(ROOT).filter((f) => f.endsWith('.html')).map((f) => {
  const d = parse(f);
  const rel = path.relative(ROOT, f).replace(/\.html$/, '');
  const url = BASE + '/' + rel.replace(/\\/g, '/');
  return { id: rel.replace(/\\/g, '/'), url, title: titleOf(d, f), desc: descOf(d), data: d };
}).filter((p) => p.id !== '404' && !p.data?.draft);

// Group by top-level section
const groups = {};
for (const p of pages) {
  const key = p.id.includes('/') ? p.id.split('/')[0] : 'root';
  (groups[key] ??= []).push(p);
}

const lines = [];
lines.push('# DefComs - Киберсигурност, SOC/NOC и Регулаторно съответствие');
lines.push('');
lines.push('> Автоматично генериран индекс на всички страници на defcoms.eu. Пълен машинночитаем документ за AI модели и търсачки.');
lines.push('');
for (const [group, items] of Object.entries(groups).sort()) {
  lines.push(`## ${group === 'root' ? 'Основни страници' : group}`);
  lines.push('');
  for (const p of items.sort((a, b) => a.title.localeCompare(b.title, 'bg'))) {
    const desc = p.desc ? `: ${p.desc}` : '';
    lines.push(`- [${p.title}](${p.url})${desc}`);
  }
  lines.push('');
}

fs.writeFileSync('public/llms-generated.txt', lines.join('\n'));
console.log('Generated public/llms.txt with', pages.length, 'pages');
