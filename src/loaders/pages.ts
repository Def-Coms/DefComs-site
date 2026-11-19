import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import type { Loader } from 'astro/loaders';

const EXT = /\.(html|md)$/;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
  );
}

function split(source: string): { data: Record<string, unknown>; body: string } {
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: source };
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}

// Page id = URL path without leading slash; "index" is the home page, "x/index" is "x".
function idFor(root: string, file: string): string {
  const rel = path.relative(root, file).split(path.sep).join('/').replace(EXT, '');
  return rel.replace(/(^|\/)index$/, '') || 'index';
}

/**
 * Loads every .html / .md file under `base` as a page.
 * .html bodies are used verbatim, .md bodies are rendered as Markdown.
 */
export function pagesLoader({ base }: { base: string }): Loader {
  return {
    name: 'pages-loader',
    async load({ store, config, parseData, renderMarkdown, generateDigest, watcher }) {
      const root = path.resolve(fileURLToPath(config.root), base);

      const loadAll = async () => {
        store.clear();
        for (const file of walk(root).filter((f) => EXT.test(f))) {
          const id = idFor(root, file);
          const { data, body } = split(fs.readFileSync(file, 'utf8'));
          const parsed = await parseData({ id, data });
          const html = file.endsWith('.md') ? (await renderMarkdown(body)).html : body;
          store.set({
            id,
            data: parsed,
            body,
            rendered: { html },
            filePath: path.relative(fileURLToPath(config.root), file),
            digest: generateDigest(fs.readFileSync(file, 'utf8')),
          });
        }
      };

      await loadAll();

      if (watcher) {
        watcher.add(root);
        const onChange = (changed: string) => {
          if (changed.startsWith(root)) loadAll();
        };
        watcher.on('change', onChange).on('add', onChange).on('unlink', onChange);
      }
    },
  };
}
