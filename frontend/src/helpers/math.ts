const squaredDistance = (a: number[], b: number[]) =>
  Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)

export const getNearestPoint = (
  points: number[][],
  origin: number[],
): number[] => {
  const [best] = points.reduce(
    ([bestPoint, bestDistance], currentPoint) => {
      const currentDistance = squaredDistance(origin, currentPoint)
      return currentDistance < bestDistance
        ? [currentPoint, currentDistance]
        : [bestPoint, bestDistance]
    },
    [[0, 0], Infinity],
  )
  return best
}

export const getArrowAngle = (origin: number[], dest: number[]): number => {
  const dy = dest[1] - origin[1]
  const dx = dest[0] - origin[0]
  const theta = (Math.atan(dy / dx) * 180) / Math.PI
  return theta
}
