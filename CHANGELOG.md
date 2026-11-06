# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `parse` `comment` option: lines beginning with the given character (outside quotes)
  are skipped, e.g. `parse(text, { comment: '#' })`.

## [0.1.0]

### Added
- RFC 4180 CSV `parse` / `stringify` with quotes, escapes, CRLF and custom delimiter.
- `parseObjects` / `stringifyObjects` for header-keyed records; round-trip safe.
