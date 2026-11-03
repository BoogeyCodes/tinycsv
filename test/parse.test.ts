import { describe, expect, it } from 'vitest'
import { parse, parseObjects } from '../src/parse.js'

describe('parse', () => {
  it('parses simple rows', () => {
    expect(parse('a,b,c\n1,2,3')).toEqual([
      ['a', 'b', 'c'],
      ['1', '2', '3'],
    ])
  })

  it('handles quoted fields with delimiters and newlines', () => {
    const csv = 'name,note\n"Smith, John","line1\nline2"'
    expect(parse(csv)).toEqual([
      ['name', 'note'],
      ['Smith, John', 'line1\nline2'],
    ])
  })

  it('unescapes doubled quotes', () => {
    expect(parse('"she said ""hi"""')).toEqual([['she said "hi"']])
  })

  it('accepts CRLF and bare CR line endings', () => {
    expect(parse('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })

  it('preserves empty fields', () => {
    expect(parse('a,,c')).toEqual([['a', '', 'c']])
    expect(parse(',,')).toEqual([['', '', '']])
  })

  it('skips empty lines by default but keeps them when asked', () => {
    expect(parse('a\n\nb')).toEqual([['a'], ['b']])
    expect(parse('a\n\nb', { skipEmptyLines: false })).toEqual([['a'], [''], ['b']])
  })

  it('supports a custom delimiter and trimming', () => {
    expect(parse('a;b;c', { delimiter: ';' })).toEqual([['a', 'b', 'c']])
    expect(parse('  a , b ', { trim: true })).toEqual([['a', 'b']])
    // quoted whitespace is preserved even with trim
    expect(parse('"  a  ",b', { trim: true })).toEqual([['  a  ', 'b']])
  })

  it('handles a trailing field with no newline', () => {
    expect(parse('a,b,')).toEqual([['a', 'b', '']])
  })

  it('returns no rows for empty input', () => {
    expect(parse('')).toEqual([])
  })
})

describe('parseObjects', () => {
  it('keys fields by the header row', () => {
    const csv = 'id,name\n1,Alice\n2,Bob'
    expect(parseObjects(csv)).toEqual([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ])
  })

  it('fills missing trailing fields with empty strings', () => {
    expect(parseObjects('a,b,c\n1,2')).toEqual([{ a: '1', b: '2', c: '' }])
  })
})

describe('comment option', () => {
  it('skips lines beginning with the comment character', () => {
    const csv = '# a header comment\na,b\n# mid comment\n1,2\n'
    expect(parse(csv, { comment: '#' })).toEqual([['a', 'b'], ['1', '2']])
  })

  it('does not treat a comment char mid-field or inside quotes as a comment', () => {
    expect(parse('a#b,c', { comment: '#' })).toEqual([['a#b', 'c']])
    expect(parse('"# not a comment",x', { comment: '#' })).toEqual([['# not a comment', 'x']])
  })

  it('is off by default', () => {
    expect(parse('#x,y')).toEqual([['#x', 'y']])
  })
})
