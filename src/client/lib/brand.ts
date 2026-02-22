/** Case-insensitive brand comparison (trim + lower). */
export function brandMatches(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
