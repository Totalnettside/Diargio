export function csvCell(value: string): string {
  const neutralized = /^\s*[=+\-@]/.test(value) || /^[\t\r]/.test(value) ? `'${value}` : value;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

export function csvRow(values: string[]): string {
  return values.map(csvCell).join(';');
}
