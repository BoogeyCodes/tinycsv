export interface ParseOptions {
  /** Field separator. Default: ','. */
  delimiter?: string
  /** Quote character. Default: '"'. */
  quote?: string
  /** Trim unquoted whitespace around fields. Default: false. */
  trim?: boolean
  /** Skip rows that are completely empty. Default: true. */
  skipEmptyLines?: boolean
}

/**
 * Parse CSV text into rows of string fields, following RFC 4180: quoted fields may contain the
 * delimiter, newlines and escaped quotes (`""`), and both `\n` and `\r\n` line endings are accepted.
 * A hand-written state machine, so it handles the quoting cases a naive `split` cannot.
 */
export function parse(input: string, options: ParseOptions = {}): string[][] {
  const delimiter = options.delimiter ?? ','
  const quote = options.quote ?? '"'
  const trim = options.trim ?? false
  const skipEmptyLines = options.skipEmptyLines ?? true

  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let fieldWasQuoted = false
  let sawAny = false

  const endField = () => {
    row.push(trim && !fieldWasQuoted ? field.trim() : field)
    field = ''
    fieldWasQuoted = false
  }

  const endRow = () => {
    endField()
    const isEmpty = row.length === 1 && row[0] === ''
    if (!(skipEmptyLines && isEmpty)) rows.push(row)
    row = []
    sawAny = false
  }

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]

    if (inQuotes) {
      if (ch === quote) {
        if (input[i + 1] === quote) {
          field += quote // an escaped quote
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === quote && field === '') {
      inQuotes = true
      fieldWasQuoted = true
      sawAny = true
      continue
    }

    if (ch === delimiter) {
      endField()
      sawAny = true
      continue
    }

    if (ch === '\n') {
      endRow()
      continue
    }
    if (ch === '\r') {
      if (input[i + 1] === '\n') i++
      endRow()
      continue
    }

    field += ch
    sawAny = true
  }

  // Flush a trailing field/row that was not terminated by a newline.
  if (sawAny || field !== '' || row.length > 0) {
    endRow()
  }

  return rows
}

/**
 * Parse CSV whose first row is a header, returning an array of objects keyed by column name.
 * Missing trailing fields become empty strings; extra fields are ignored.
 */
export function parseObjects(input: string, options: ParseOptions = {}): Array<Record<string, string>> {
  const rows = parse(input, options)
  if (rows.length === 0) return []

  const [header, ...dataRows] = rows
  return dataRows.map((cells) => {
    const record: Record<string, string> = {}
    header.forEach((name, index) => {
      record[name] = cells[index] ?? ''
    })
    return record
  })
}
