const DISTANCE_CUTOFF_METERS = 5

const distance = (one: number[], two: number[]) => {
  const [lat1, lon1] = one
  const [lat2, lon2] = two
  const R = 6378.137 // Radius of earth in KM
  const dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180
  const dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d * 1000 // meters
}

const sortByDistance = (a: PointWithData, b: PointWithData) =>
  a.distance - b.distance
const sortByIndex = (a: PointWithData, b: PointWithData) => a.index - b.index

export const getNextPoint = (points: Point[], origin: number[]): number[] => {
  console.log('getNextPoint')
  if (points.length == 0) {
    throw new Error('No points on route!')
  }
  if (points.length < 3) {
    return points.slice(-1)[0]
  }

  const pointsWithData: PointWithData[] = []

  points.forEach((point, index) => {
    const dist = distance(origin, point)
    pointsWithData.push({ distance: dist, point, index })
  })

  pointsWithData.sort(sortByDistance)
  const closestThreePoints = pointsWithData.slice(0, 3)
  /*
   * Edge case: If the user is sitting right on point0, the 0th point will be filtered out due to being too close, and then closestTwoPointsFiltered would look like this:
   * [
   *   [20, <point1>, 1],
   *   [40, <point2>, 2],
   * ]
   *
   * In this case we want to nav towards point1, since it's the best near point, but we'll then end up with point2 instead.
   * So if closestThreePoints has indices 0, 1, and 2, and dist0 < DISTANCE_CUTOFF_METERS, nextPoint = closestThreePoints[1].point
   *
   * Otherwise, we throw out any points that are too close, narrow it down to 2 points, and then navigate towards whichever is further down the route (whichever has a greater index)
   * ]
   */
  const indices = closestThreePoints.map(({ index }) => index)
  if (
    indices.includes(0) &&
    indices.includes(1) &&
    indices.includes(2) &&
    closestThreePoints[0].distance < DISTANCE_CUTOFF_METERS
  ) {
    return closestThreePoints[1].point
  }
  const closestThreePointsFiltered = closestThreePoints.filter(
    ({ distance: dist }) => dist > DISTANCE_CUTOFF_METERS,
  )

  const closestPointsSortedByIndex = closestThreePointsFiltered
  closestPointsSortedByIndex.sort(sortByIndex)

  const nextPointData = closestPointsSortedByIndex.slice(-1)[0]
  return nextPointData.point
}

export const getAngle = (origin: number[], dest: number[]): number => {
  const dx = dest[1] - origin[1]
  const dy = origin[0] - dest[0]
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI

  console.info(`dx: ${dx}  dy: ${dy} theta: ${theta}`)
  return theta
}
