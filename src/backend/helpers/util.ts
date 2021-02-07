type scalar =
  | string
  | boolean
  | number
  | string[]
  | boolean[]
  | number[]
  | string[][]
  | boolean[][]
  | number[][]

export const removeConsecutiveDuplicates = <T extends scalar>(arr: T[]): T[] =>
  arr.reduce((acc, elem, index) => {
    const isDuplicateOfPrevious = elem === acc[index - 1]
    if (isDuplicateOfPrevious) {
      return acc
    }
    return [...acc, elem]
  }, [])
