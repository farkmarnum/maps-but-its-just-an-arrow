const NEXT_N_POINTS_COUNT = 3

const squaredDistance = (a: number[], b: number[]) =>
  Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)

type Distance = number
type Point = [number, number]
type Index = number

type PointWithDistance = [Distance, Point, Index]

const sortByDistance = (a: PointWithDistance, b: PointWithDistance) =>
  a[0] - b[0]
const sortByIndex = (a: PointWithDistance, b: PointWithDistance) => a[2] - b[2]

export const getNextPoint = (
  points: number[][],
  origin: number[],
): number[] => {
  if (points.length == 0) {
    throw new Error('No points on route!')
  }
  if (points.length < 3) {
    return points.slice(-1)[0]
  }

  const pointsWithDistance: PointWithDistance[] = []

  points.forEach((point: number[], i: number) => {
    const dist = squaredDistance(origin, point)
    pointsWithDistance.push([dist, point as Point, i])
  })

  pointsWithDistance.sort(sortByDistance)

  // Get the closest N points
  const closestNPoints = pointsWithDistance.slice(0, NEXT_N_POINTS_COUNT + 1)
  closestNPoints.sort(sortByIndex)

  // Weight them by how far they are along the route
  const weightedPoints: [Point, number][] = closestNPoints.map(
    ([_, point], i) => {
      // heavily weight the last point:
      return [point, i + 1]
    },
  )

  let sumLat = 0
  let sumLng = 0
  let sumWeights = 0

  weightedPoints.forEach(([point, weight]) => {
    sumLat += point[0] * weight
    sumLng += point[1] * weight
    sumWeights += weight
  })

  const averagedPoint = [sumLat / sumWeights, sumLng / sumWeights]

  return averagedPoint
}

export const getAngle = (origin: number[], dest: number[]): number => {
  const dx = dest[1] - origin[1]
  const dy = origin[0] - dest[0]
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI

  console.log(`dx: ${dx}  dy: ${dy} theta: ${theta}`)
  return theta
}
