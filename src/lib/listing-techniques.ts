export function toggleTechnique(selected: string[], technique: string): string[] {
  return selected.includes(technique) ? selected.filter((item) => item !== technique) : [...selected, technique];
}

export function serializeTechniques(selected: string[]): string {
  return [...new Set(selected)].join(', ');
}