const baseURL = process.env.PREACT_APP_BACKEND_URL

if (!baseURL) {
  throw new Error('PREACT_APP_BACKEND_URL must be specified!')
}

export const getSuggestions = async (input: string): Promise<Suggestion[]> => {
  const url = new URL(`${baseURL}/suggestions`)
  url.search = new URLSearchParams({ input }).toString()

  const response = await fetch(url.toString())
  const data = await response.json()

  const { suggestions } = data
  return suggestions
}

interface GetDirectionsArgs {
  destinationPlaceId: string
  originLat: number
  originLng: number
}

export const getDirections = async ({
  destinationPlaceId,
  originLat,
  originLng,
}: GetDirectionsArgs): Promise<number[][]> => {
  const url = new URL(`${baseURL}/directions`)
  url.search = new URLSearchParams({
    destinationPlaceId,
    originLat: String(originLat),
    originLng: String(originLng),
  }).toString()

  const response = await fetch(url.toString())
  const data = await response.json()

  const { points } = data
  return points
}
