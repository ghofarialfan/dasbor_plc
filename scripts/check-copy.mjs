import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root = fileURLToPath(new URL('../src', import.meta.url));
const forbidden = /dummy|mock|simula(?:si|ted)|contoh|fake|demo|bukan\s+live\s+stream|preview\s+only/i;
function files(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [join(dir, e.name)] : []); }
function check(text, filename) {
 const source = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, true, filename.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
 const findings = [];
 function walk(n) {
  const p = n.parent;
  const literal = ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n);
  if (ts.isJsxText(n) || literal) {
   const value = n.text;
   // Exceptions apply only to code locations, never JSX labels.
   const codeOnly = literal && ((['simulated', 'not-simulated', 'no-current-data'].includes(value) && filename.endsWith('/data/demo.ts') && !ts.isJsxAttribute(p)) || ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) ||
    (ts.isPropertyAssignment(p) && p.name === n) || ts.isElementAccessExpression(p) ||
    (ts.isBinaryExpression(p) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(p.operatorToken.kind)) ||
    (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && ['getItem','setItem','removeItem','startsWith'].includes(p.expression.name.text) && /^genset-demo(?::v1:.*|-site)?$/.test(value)) ||
    (ts.isVariableDeclaration(p) && p.name.getText(source) === 'PREFIX' && value === 'genset-demo:v1:'));
   if (!codeOnly && forbidden.test(value)) findings.push(`${filename}:${source.getLineAndCharacterOfPosition(n.pos).line + 1}: ${JSON.stringify(value.trim())}`);
  }
  ts.forEachChild(n, walk);
 }
 walk(source); return findings;
}
for (const text of ['<button>Reset data demo</button>', '<button aria-label="simulated" />', '<Hint label="mock" />', '<DialogTitle>contoh</DialogTitle>', 'const toast = `Tiket simulasi ${id}`;', '<button>genset-demo-site</button>']) assert.ok(check(text, 'fixture.tsx').length, text);
assert.equal(check('import { useDemo } from "@/context/demo-context"; const x = <span>Prototype</span>;', 'fixture.tsx').length, 0);
const findings = files(root).flatMap(f => check(readFileSync(f, 'utf8'), f));
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
for (const v of html.matchAll(/<title>(.*?)<\/title>|content="([^"]*)"/g)) if (forbidden.test(v[1] ?? v[2] ?? '')) findings.push(`index.html: ${v[0]}`);
if (findings.length) { console.error(findings.join('\n')); process.exit(1); }
console.log('PASS: UI copy guard and negative fixtures for button, tooltip, aria-label, dialog, toast.');
