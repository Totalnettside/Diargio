import { describe, expect, it } from 'vitest';
import { csvCell, csvRow } from './csv';

describe('CSV export safety', () => {
  it.each(['=HYPERLINK("https://example.invalid")', '+1+2', '-2+3', '@SUM(A1:A2)', '  =1+1'])('neutralizes formula-leading value %s', (value) => {
    expect(csvCell(value)).toBe(`"'${value.replace(/"/g, '""')}"`);
  });
  it('quotes delimiters, quotes and newlines without altering ordinary values', () => {
    expect(csvRow(['Ola Nordmann', 'ola@example.com', 'Sted; "nord"', 'Linje 1\nLinje 2'])).toBe('"Ola Nordmann";"ola@example.com";"Sted; ""nord""";"Linje 1\nLinje 2"');
  });
});
