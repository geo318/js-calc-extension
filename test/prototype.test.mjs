import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const run = code => execFileSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8' }).trim();
test('root import has no prototype side effects', () => {
  assert.equal(run("import '@geo318/safe-calc'; console.log('add' in Number.prototype)"), 'false');
});
test('adapter provides corrected legacy methods, non-enumerably', () => {
  assert.equal(run(`import '@geo318/safe-calc/prototype';
    import assert from 'node:assert/strict';
    assert.equal((1.005).add(0), 1.01);
    assert.equal((5).subtract(3), 2);
    assert.equal((2).multiply(3), 6);
    assert.equal((6).divide(3), 2);
    assert.equal((5).remainder(), 1);
    assert.equal((0.456).percent(), 45.6);
    assert.equal((0).format('USD'), '$0.00');
    assert.equal(Object.getOwnPropertyDescriptor(Number.prototype, 'add').enumerable, false);
    assert.throws(() => (1).divide(0), { code: 'DIVISION_BY_ZERO' });
    assert.throws(() => (1).add('€12.50'), { code: 'INVALID_INPUT' });
    console.log('ok');`), 'ok');
});
test('adapter preflight refuses collisions without partial installation', () => {
  assert.equal(run(`import assert from 'node:assert/strict';
    Object.defineProperty(Number.prototype, 'subtract', { get() { throw new Error('getter must not execute'); }, configurable: true });
    await assert.rejects(import('@geo318/safe-calc/prototype'), { code: 'PROTOTYPE_CONFLICT' });
    assert.equal(Object.hasOwn(Number.prototype, 'add'), false);
    console.log('ok');`), 'ok');
});
test('ESM and CommonJS adapters can be loaded together idempotently', () => {
  assert.equal(run(`import { createRequire } from 'node:module';
    const require = createRequire(import.meta.url);
    await import('@geo318/safe-calc/prototype');
    require('@geo318/safe-calc/prototype');
    console.log((0.1).add(0.2));`), '0.3');
});
test('frozen intrinsics fail clearly without any mutation', () => {
  assert.equal(run(`import assert from 'node:assert/strict';
    Object.freeze(Number.prototype);
    await assert.rejects(import('@geo318/safe-calc/prototype'), { code: 'PROTOTYPE_CONFLICT' });
    console.log(Object.hasOwn(Number.prototype, 'add'));`), 'false');
});
