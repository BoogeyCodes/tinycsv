# tinycsv

[![CI](https://github.com/BoogeyCodes/tinycsv/actions/workflows/ci.yml/badge.svg)](https://github.com/BoogeyCodes/tinycsv/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-success)
![ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

A tiny CSV parser and stringifier for TypeScript, with no dependencies. It follows RFC 4180, so quoted
fields, escaped quotes, embedded commas and newlines all work — the cases a naive `split(',')` gets
wrong.

```ts
import { parse, stringify, parseObjects } from 'tinycsv'

parse('name,note\n"Smith, John","line1\nline2"')
// [ ['name', 'note'], ['Smith, John', 'line1\nline2'] ]

parseObjects('id,name\n1,Alice\n2,Bob')
// [ { id: '1', name: 'Alice' }, { id: '2', name: 'Bob' } ]

stringify([['a', 'b'], ['has,comma', 'ok']])
// 'a,b\n"has,comma",ok'
```

## Why

CSV looks trivial until a field contains a comma, a quote or a newline — then `split(',')` breaks, and
reaching for a big library feels like overkill. tinycsv is the small, correct middle: a proper RFC
4180 state-machine parser and a matching stringifier that quotes only what needs quoting, round-trip
safe, in a couple hundred lines with no dependencies.

## Features

- **Parsing** that handles quoted fields containing the delimiter, newlines and escaped quotes
  (`""`), with `\n`, `\r\n` and bare `\r` line endings.
- **Stringifying** that quotes only the fields that need it (or all, on request), and renders `null`
  and `undefined` as empty.
- **Object mapping**: `parseObjects` keys rows by a header row; `stringifyObjects` writes a header and
  rows, inferring columns or using an explicit order.
- **Options**: custom `delimiter` (so it reads TSV too), `quote`, `trim`, `skipEmptyLines`, `newline`,
  `quoteAll`.
- **Round-trip safe**: `parse(stringify(rows))` returns the original data.

## API

```ts
import { parse, parseObjects, stringify, stringifyObjects } from 'tinycsv'

// string[][]
parse(text, { delimiter: ',', quote: '"', trim: false, skipEmptyLines: true })

// Record<string, string>[]
parseObjects(text, options)

// string
stringify(rows, { delimiter: ',', quote: '"', newline: '\n', quoteAll: false })
stringifyObjects(records, { columns: ['a', 'b'], ...options })
```

## Reading TSV

```ts
parse('a\tb\n1\t2', { delimiter: '\t' })   // [['a','b'], ['1','2']]
```

## Testing

```bash
npm install
npm test            # 19 tests across parse, stringify and round-tripping
npm run build       # ESM + CJS + .d.ts via tsup
```

Tests cover quoted fields with commas and newlines, doubled-quote escapes, CRLF/CR endings, empty
fields and lines, custom delimiters, trimming, trailing fields, object mapping, selective quoting, and
a parse/stringify round trip. CI runs on Linux and Windows across Node 18/20/22.

## Ideas for later

- Streaming parse for very large files.
- Type coercion hooks (numbers, booleans, dates).
- A header-rename map.

## License

MIT
