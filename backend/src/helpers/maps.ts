import {
  Client,
  PlaceAutocompleteResult,
  TravelMode,
  DirectionsStep,
} from '@googlemaps/google-maps-services-js'
import * as polyline from '@mapbox/polyline'
import * as dotenv from 'dotenv'
import { removeConsecutiveDuplicates } from './utils'

interface GetDirectionsArgs {
  destinationPlaceId: string
  originLat: number
  originLng: number
}

dotenv.config()

const key = process.env.GOOGLE_MAPS_API_KEY

const client = new Client({})

export const autocompletePlace = async (
  input: string,
): Promise<PlaceAutocompleteResult[]> => {
  try {
    const resp = await client.placeAutocomplete({ params: { input, key } })
    return resp.data.predictions
  } catch (err) {
    const errorMsg = err.response.data.error_message
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
}

export const getDirections = async ({
  destinationPlaceId,
  originLat,
  originLng,
}: GetDirectionsArgs): Promise<DirectionsStep[]> => {
  try {
    const resp = await client.directions({
      params: {
        origin: {
          lat: originLat,
          lng: originLng,
        },
        destination: `place_id:${destinationPlaceId}`,
        mode: TravelMode.walking,
        departure_time: 'now',
        key,
      },
    })

    const { routes } = resp.data
    if (routes.length === 0) {
      throw new Error('No route found!')
    }

    const [leg] = routes[0].legs
    if (!leg || !leg.steps) {
      throw new Error('No route found!')
    }

    return leg.steps
  } catch (err) {
    const errorMsg = err.response ? err.response.data.error_message : err
    console.error(errorMsg)
    throw new Error(errorMsg)
  }
}

export const getPointsForRoute = async ({
  destinationPlaceId,
  originLat,
  originLng,
}: GetDirectionsArgs): Promise<number[][]> => {
  const steps = await getDirections({
    destinationPlaceId,
    originLat,
    originLng,
  })

  const points = steps.reduce(
    (acc, step) => [...acc, ...polyline.decode(step.polyline.points)],
    [],
  )

  const uniquePoints = removeConsecutiveDuplicates<number[]>(points)
  return uniquePoints
}
