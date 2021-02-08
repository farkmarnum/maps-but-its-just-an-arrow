const METERS_PER_DEGREE = 111111 // https://gis.stackexchange.com/questions/2951/algorithm-for-offsetting-a-latitude-longitude-by-some-amount-of-meters

const EXTENSION_PADDING_IN_METERS = 15
const EXTENSION_PADDING = EXTENSION_PADDING_IN_METERS / METERS_PER_DEGREE

const SIDE_PADDING_IN_METERS = 40
const SIDE_PADDING = SIDE_PADDING_IN_METERS / METERS_PER_DEGREE

const isPointContainedInRegion = (point: Point, region: Region): boolean => {
  const x = point[0]
  const y = point[1]

  let inside = false
  for (let i = 0, j = region.length - 1; i < region.length; j = i++) {
    const xi = region[i][0],
      yi = region[i][1]
    const xj = region[j][0],
      yj = region[j][1]

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

const getRegionForSource = (source: Point): Region => {
  const [x, y] = source
  const originPadding = SIDE_PADDING * 3

  return [
    [x - originPadding, y - originPadding],
    [x - originPadding, y + originPadding],
    [x + originPadding, y - originPadding],
    [x + originPadding, y + originPadding],
  ]
}

const getRegion = (a: Point, b: Point): Region => {
  const vectorFromAToB = [b[0] - a[0], b[1] - a[1]]
  const magnitude = Math.sqrt(
    Math.pow(vectorFromAToB[0], 2) + Math.pow(vectorFromAToB[1], 2),
  )

  // The two corners of the region by b
  const unitVectorFromAToB = [
    vectorFromAToB[0] / magnitude,
    vectorFromAToB[1] / magnitude,
  ]

  const bExtended: Point = [
    b[0] + unitVectorFromAToB[0] * EXTENSION_PADDING,
    b[1] + unitVectorFromAToB[1] * EXTENSION_PADDING,
  ]

  const bCorner1: Point = [
    bExtended[0] + unitVectorFromAToB[1] * SIDE_PADDING,
    bExtended[1] + -unitVectorFromAToB[0] * SIDE_PADDING,
  ]
  const bCorner2: Point = [
    bExtended[0] + -unitVectorFromAToB[1] * SIDE_PADDING,
    bExtended[1] + unitVectorFromAToB[0] * SIDE_PADDING,
  ]

  // The two corners of the region by a
  const unitVectorFromBToA = [
    -vectorFromAToB[0] / magnitude,
    -vectorFromAToB[1] / magnitude,
  ]

  const aExtended: Point = [
    a[0] + unitVectorFromBToA[0] * EXTENSION_PADDING,
    a[1] + unitVectorFromBToA[1] * EXTENSION_PADDING,
  ]

  const aCorner1: Point = [
    aExtended[0] + unitVectorFromBToA[1] * SIDE_PADDING,
    aExtended[1] + -unitVectorFromBToA[0] * SIDE_PADDING,
  ]
  const aCorner2: Point = [
    aExtended[0] + -unitVectorFromBToA[1] * SIDE_PADDING,
    aExtended[1] + unitVectorFromBToA[0] * SIDE_PADDING,
  ]

  return [bCorner1, bExtended, bCorner2, aCorner1, aExtended, aCorner2]
}

export const getNextPointUsingRegions = (
  points: Point[],
  origin: Point,
): number[] | undefined => {
  if (points.length == 0) {
    throw new Error('No points on route!')
  }
  if (points.length < 3) {
    return points.slice(-1)[0]
  }

  const regions = points.map((point, i) => {
    const pointIsSource = i === 0

    if (pointIsSource) {
      return { point, region: getRegionForSource(point), i }
    }

    const previousPointInRoute = points[i - 1]
    return {
      point,
      region: getRegion(point, previousPointInRoute),
      i,
    }
  })
  const containingRegions = regions
    .filter(({ region }) => isPointContainedInRegion(origin, region))
    .sort((a, b) => (a.i > b.i ? 1 : -1))

  const nextPointData = containingRegions.slice(-1)[0]

  return nextPointData?.point
}

const getDistance = (one: Point, two: Point) => {
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

export const getNearestPoint = (
  points: Point[],
  origin: Point,
): number[] | undefined => {
  if (points.length == 0) {
    throw new Error('No points on route!')
  }
  if (points.length < 3) {
    return points.slice(-1)[0]
  }

  let nearestPoint: Point | undefined
  let nearestPointDistance = Infinity

  points.forEach((point) => {
    const dist = getDistance(origin, point)
    if (dist < nearestPointDistance) {
      nearestPointDistance = dist
      nearestPoint = point
    }
  })

  return nearestPoint
}

export const getAngle = (origin: number[], dest: number[]): number => {
  const dx = dest[1] - origin[1]
  const dy = origin[0] - dest[0]
  const theta = (Math.atan2(dy, dx) * 180) / Math.PI

  return theta
}
