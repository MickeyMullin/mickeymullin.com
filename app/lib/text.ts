// "A, B, and C": joins a list for prose, always with the serial comma.
export function listOf(items: readonly string[], conjunction: 'and' | 'or' = 'and') {
  if (items.length < 3) return items.join(` ${conjunction} `)
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items.at(-1)}`
}
