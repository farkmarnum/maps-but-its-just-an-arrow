import { autocompletePlace, getDirections } from './helpers/maps'
import * as polyline from '@mapbox/polyline'

const main = async () => {
  const suggestions = await autocompletePlace('***REMOVED***')
  const [place] = suggestions
  const { place_id: placeId } = place

  const steps = await getDirections({
    destinationPlaceId: placeId,
    originLat: 40.781322,
    originLng: -73.973991,
  })

  // steps = steps.reduce(
  //   (acc, step) => [
  //     ...acc,
  //     {
  //       ...step,
  //       polyline: {
  //         points: polyline.decode(step.polyline.points),
  //       },
  //     },
  //   ],
  //   [],
  // )

  const points = steps.reduce(
    (acc, step) => [...acc, ...polyline.decode(step.polyline.points)],
    [],
  )
  console.info(JSON.stringify(points))
}

main()
