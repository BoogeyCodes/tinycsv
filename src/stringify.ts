export interface StringifyOptions {
  /** Field separator. Default: ','. */
  delimiter?: string
  /** Quote character. Default: '"'. */
  quote?: string
  /** Line ending. Default: '\n'. */
  newline?: string
  /** Quote every field, not only those that need it. Default: false. */
  quoteAll?: boolean
}

/** Serialise rows of values into CSV text, quoting only the fields that need it. */
export function stringify(rows: ReadonlyArray<ReadonlyArray<unknown>>, options: StringifyOptions = {}): string {
  const delimiter = options.delimiter ?? ','
  const quote = options.quote ?? '"'
  const newline = options.newline ?? '\n'
  const quoteAll = options.quoteAll ?? false

  const needsQuoting = (text: string) =>
    text.includes(delimiter) || text.includes(quote) || text.includes('\n') || text.includes('\r')

  const encodeField = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value)
    if (quoteAll || needsQuoting(text)) {
      return quote + text.split(quote).join(quote + quote) + quote
    }
    return text
  }

  return rows.map((row) => row.map(encodeField).join(delimiter)).join(newline)
}

/**
 * Serialise an array of objects to CSV. Columns are taken from `columns` if given, otherwise from the
 * union of keys across all rows (in first-seen order). The header row is written first.
 */
export function stringifyObjects(
  records: ReadonlyArray<Record<string, unknown>>,
  options: StringifyOptions & { columns?: readonly string[] } = {},
): string {
  const columns = options.columns ?? collectColumns(records)
  const header = columns as readonly unknown[]
  const body = records.map((record) => columns.map((column) => record[column]))
  return stringify([header, ...body], options)
}

function collectColumns(records: ReadonlyArray<Record<string, unknown>>): string[] {
  const seen = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) seen.add(key)
  }
  return [...seen]
}
