import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { calc } from '../dist/esm/index.js';
const python = process.env.PYTHON ?? 'python3';
const rows = execFileSync(python, ['scripts/reference.py'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim().split('\n').map(JSON.parse);
let comparisons = 0;
for (const row of rows) {
  for (const [operation, expected] of Object.entries(row.operations)) {
    assert.equal(calc(row.a)[operation](row.b).toString(), expected, `${row.a} ${operation} ${row.b}`);
    comparisons++;
  }
  for (const [rounding, expected] of Object.entries(row.rounding)) {
    assert.equal(calc(row.a).round(row.precision, rounding).toString(), expected.round, `round ${rounding}`);
    assert.equal(calc(row.a).divide(row.b, { precision: row.precision, rounding }).toString(), expected.divide, `divide ${rounding}`);
    comparisons += 2;
  }
  const a = calc(row.a), b = calc(row.b);
  assert.ok(a.add(b).subtract(b).eq(a), 'add/subtract inverse');
  assert.ok(a.multiply(b).eq(b.multiply(a)), 'multiplication commutes');
  assert.ok(a.round(row.precision).round(row.precision).eq(a.round(row.precision)), 'rounding idempotence');
}
console.log(`${comparisons} independent Python Decimal comparisons and ${rows.length * 3} algebraic properties passed (seed 318).`);
