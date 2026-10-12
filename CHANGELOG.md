# Changelog

## 2.0.0 - Unreleased

Prepared 2026-10-12. This version is not claimed to be published to npm.

### Breaking changes

- Root imports no longer modify Number.prototype. Use the pure named API or
  explicitly import `@geo318/safe-calc/prototype` during migration.
- Pure calculations return immutable Decimal objects and no longer round every
  operation to two decimal places. Division has explicit decimal-place precision
  (default 20) and a rounding mode (default half-up).
- Invalid decimal inputs, division/remainder by zero, unsupported precision,
  resource-limit violations, and lossy number conversion throw explicit errors.
- Node.js 22+ is the supported runtime baseline. Deep imports are restricted by
  an explicit exports map. See MIGRATION.md for the full upgrade guide.

### Added

- Zero-runtime-dependency, BigInt-backed decimal coefficients and scales.
- Fluent `calc()` / `Decimal` and functional arithmetic APIs.
- Six rounding modes: half-up, half-even, down, up, floor, and ceil.
- Comparisons, clamp, absolute/negative values, exact percentages, iterable sum,
  average, minimum, and maximum.
- Fixed-width decimal output, string-based JSON serialization, and guarded
  `toNumber()` with an explicit lossy-conversion escape hatch.
- Locale-aware number/currency formatting without intermediate Number conversion;
  currency-aware defaults, accounting display, and exact bigint minor units.
- Stable error codes, strict option-key validation, and bounded input/work sizes.
- Non-enumerable, collision-checked, opt-in Number prototype migration adapter.
- ESM/CommonJS builds, generated declarations, precise published-file controls,
  license text, migration guide, and release instructions.
- Node 22/24 CI, isolated npm-tarball consumer checks, deterministic independent
  Python Decimal comparisons, algebraic properties, and OIDC release workflow.

### Fixed

- Tiny results disappearing through implicit rounding.
- Decimal half-up ties such as 1.005, including negative amounts.
- Partial numeric/currency strings silently becoming incorrect amounts.
- Inconsistent divide/remainder-by-zero behavior.
- Percentage precision mismatches and currency zero formatting.
- Locale-fragile decimal splitting and missing meaningful large integer digits.
- Infinity output for unsupported Intl formatting magnitudes now fails explicitly.
- Incorrect chained-calculation and trailing-zero examples in the previous README.

### Validation

The implementation includes regression/boundary tests, ESM and CommonJS runtime
and type-consumer checks, 16,000 independent arithmetic/rounding comparisons,
3,000 deterministic algebraic checks, and minor-unit round-trip checks.
Reference tests require Python 3 only for development/CI; it is not a package
dependency. Passing these tests is not a proof of correctness for every input.

## 1.0.9

Previous Number.prototype-based API. Repository metadata version before the
2.0.0 preparation; historic registry publication date was not re-verified.
