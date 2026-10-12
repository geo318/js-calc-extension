"""Independent, deterministic oracle. Python's decimal is test-only, never runtime code."""
from decimal import Decimal, localcontext, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_DOWN, ROUND_UP, ROUND_FLOOR, ROUND_CEILING
import json
import random

rng = random.Random(318)
modes = {'half-up': ROUND_HALF_UP, 'half-even': ROUND_HALF_EVEN, 'down': ROUND_DOWN, 'up': ROUND_UP, 'floor': ROUND_FLOOR, 'ceil': ROUND_CEILING}
def text(value):
    if value == 0:
        return '0'
    raw = format(value, 'f')
    return raw.rstrip('0').rstrip('.') if '.' in raw else raw

with localcontext() as context:
    context.prec = 300
    for _ in range(1000):
        a = Decimal(rng.randint(-10**30, 10**30)).scaleb(-rng.randint(0, 25))
        b = Decimal(rng.randint(-10**30, 10**30) or 1).scaleb(-rng.randint(0, 25))
        precision = rng.randint(0, 30)
        unit = Decimal(1).scaleb(-precision)
        operations = {'add': a+b, 'subtract': a-b, 'multiply': a*b, 'remainder': a%b}
        row = {'a': text(a), 'b': text(b), 'precision': precision, 'operations': {k: text(v) for k, v in operations.items()}, 'rounding': {}}
        for name, mode in modes.items():
            row['rounding'][name] = {'round': text(a.quantize(unit, rounding=mode)), 'divide': text((a/b).quantize(unit, rounding=mode))}
        print(json.dumps(row))
