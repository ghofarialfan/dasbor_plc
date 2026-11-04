import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

// Copy guard: user-visible text must not contain words that expose the
// prototype as fake/demo/mock. We use the TypeScript AST so that only real
// string literals and JSX text are checked — never variable/function names.
const ROOT = fileURLToPath(new URL('../src', import.meta.url));
const BANNED = ['dummy', 'mock', 'simulasi', 'simulated', 'contoh', 'fake', 'demo', 'live stream', 'preview only'];

// Code-only string literals that legitimately contain a banned token but are
// never shown to users (enum/status values, storage keys).
const ALLOWED_LITERALS = new Set(['simulated', 'not-simulated', 'no-current-data', 'genset-demo-site']);
const ALLOWED_PREFIXES = [/^@\//, /^genset-demo:/, /^genset-demo-/];

function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(p));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function scan(text, file, findings) {
  const lower = text.toLowerCase();
  for (const word of BANNED) {
    if (lower.includes(word)) findings.push(`${file} → ${JSON.stringify(text.trim())}`);
  }
}

function checkFile(file, findings) {
  const text = readFileSync(file, 'utf8');
  const scriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind);
  function walk(node) {
    if (ts.isJsxText(node)) {
      scan(node.text, file, findings);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const lit = node.text;
      if (ALLOWED_LITERALS.has(lit)) return;
      if (ALLOWED_PREFIXES.some(re => re.test(lit))) return;
      scan(lit, file, findings);
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
}

const findings = [];
for (const file of collectFiles(ROOT)) checkFile(file, findings);
if (findings.length) {
  console.error('COPY GUARD FAILED');
  for (const f of findings) console.error('  ' + f);
  process.exit(1);
}
console.log('PASS: copy guard — no banned words in user-visible text.');
