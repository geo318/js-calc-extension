/** Exercise the actual npm tarball from an isolated consumer, without registry access. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const expected = JSON.parse(readFileSync('package.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
assert.equal(lock.version, expected.version);
assert.equal(lock.packages[''].version, expected.version);
const temporary = mkdtempSync(join(tmpdir(), 'safe-calc-consumer-'));
let tarball;
try {
  const [info] = JSON.parse(execFileSync(npm, ['pack', '--json', '--ignore-scripts'], { encoding: 'utf8' }));
  tarball = resolve(info.filename);
  const files = info.files.map(file => file.path);
  for (const name of ['dist/esm/index.js', 'dist/esm/index.d.ts', 'dist/cjs/index.js', 'dist/cjs/index.d.ts', 'dist/cjs/package.json', 'dist/esm/prototype.js', 'dist/cjs/prototype.js', 'README.md', 'CHANGELOG.md', 'MIGRATION.md', 'LICENSE']) assert.ok(files.includes(name), `Missing packed file: ${name}`);
  assert.ok(!files.some(file => /^(src|test|scripts|node_modules|\.github)\//.test(file)), 'Unexpected development files in tarball');
  writeFileSync(join(temporary, 'package.json'), '{"private":true,"type":"module"}\n');
  execFileSync(npm, ['install', tarball, '--ignore-scripts', '--offline', '--no-audit', '--no-fund'], { cwd: temporary, stdio: 'pipe' });
  const installed = JSON.parse(readFileSync(join(temporary, 'node_modules/@geo318/safe-calc/package.json'), 'utf8'));
  assert.equal(installed.version, expected.version);
  assert.equal(Object.keys(installed.dependencies ?? {}).length, 0);
  const assertion = `if (api.calc('.1').add('.2').toString() !== '0.3') throw Error('incorrect result'); if ('add' in Number.prototype) throw Error('root side effect');`;
  execFileSync(process.execPath, ['--input-type=module', '-e', `import * as api from '@geo318/safe-calc'; ${assertion}`], { cwd: temporary });
  execFileSync(process.execPath, ['--input-type=commonjs', '-e', `const api = require('@geo318/safe-calc'); ${assertion}`], { cwd: temporary });
  for (const extension of ['mts', 'cts']) {
    writeFileSync(join(temporary, `root.${extension}`), `import {calc, formatMoney} from '@geo318/safe-calc';\nconst result: string = calc('1.005').round(2).toString();\nformatMoney(result, { currency: 'USD' });\n// @ts-expect-error root must not augment Number\n(1).add(2);\n`);
    execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', `root.${extension}`], { cwd: temporary, stdio: 'pipe' });
    writeFileSync(join(temporary, `prototype.${extension}`), `import '@geo318/safe-calc/prototype';\nconst result: number = (1).add(2);\n`);
    execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--strict', '--target', 'ES2022', '--module', 'NodeNext', `prototype.${extension}`], { cwd: temporary, stdio: 'pipe' });
  }
  console.log(`Package verified: ${info.name}@${info.version}; ${files.length} files, ${info.size} bytes packed. ESM, CJS, and both consumer type paths pass.`);
} finally {
  rmSync(temporary, { recursive: true, force: true });
  if (tarball) rmSync(tarball, { force: true });
}
