import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse.js'
import { stringify, stringifyObjects } from '../src/stringify.js'

describe('stringify', () => {
  it('serialises simple rows', () => {
    expect(
      stringify([
        ['a', 'b'],
        ['1', '2'],
      ]),
    ).toBe('a,b\n1,2')
  })

  it('quotes only fields that need it', () => {
    const csv = stringify([['plain', 'has,comma', 'has"quote', 'has\nnewline']])
    expect(csv).toBe('plain,"has,comma","has""quote","has\nnewline"')
  })

  it('can quote every field', () => {
    expect(stringify([['a', 'b']], { quoteAll: true })).toBe('"a","b"')
  })

  it('renders null and undefined as empty, and numbers as text', () => {
    expect(stringify([[null, undefined, 42, 'x']])).toBe(',,42,x')
  })

  it('supports a custom delimiter and newline', () => {
    expect(
      stringify(
        [
          ['a', 'b'],
          ['1', '2'],
        ],
        { delimiter: ';', newline: '\r\n' },
      ),
    ).toBe('a;b\r\n1;2')
  })
})

describe('stringifyObjects', () => {
  it('writes a header and rows, inferring columns', () => {
    const csv = stringifyObjects([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ])
    expect(csv).toBe('id,name\n1,Alice\n2,Bob')
  })

  it('honours an explicit column order', () => {
    const csv = stringifyObjects([{ a: 1, b: 2 }], { columns: ['b', 'a'] })
    expect(csv).toBe('b,a\n2,1')
  })
})

describe('round trip', () => {
  it('parse(stringify(x)) preserves the data', () => {
    const rows = [
      ['name', 'quote', 'note'],
      ['Smith, John', 'she said "hi"', 'line1\nline2'],
      ['', '42', ''],
    ]
    expect(parse(stringify(rows))).toEqual(rows)
  })
})
