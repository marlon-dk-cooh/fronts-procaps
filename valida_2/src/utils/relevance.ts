export function relevanceColor(
  r: number,
  success: string,
  accent: string,
  warn: string,
): string {
  return r >= 0.9 ? success : r >= 0.8 ? accent : warn
}
