const deepEq = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((elem, i) => deepEq(elem, b[i]))
  }

  return a === b
}

export const removeConsecutiveDuplicates = <T>(arr: T[]): T[] =>
  arr.reduce((acc, elem) => {
    const prev = acc.slice(-1)[0]
    if (deepEq(elem, prev)) {
      return acc
    }
    return [...acc, elem]
  }, [])
