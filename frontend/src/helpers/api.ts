import toastr from 'toastr'
const baseURL = process.env.PREACT_APP_BACKEND_URL

if (!baseURL) {
  throw new Error('PREACT_APP_BACKEND_URL must be specified!')
}

interface GetSuggestionsArgs {
  input: string
  location?: [number, number]
}

export const getSuggestions = async ({
  input,
  location,
}: GetSuggestionsArgs): Promise<Suggestion[]> => {
  try {
    const params: Record<string, string> = { input }
    if (location) {
      params.location = `${location[0]},${location[1]}`
    }

    const url = new URL(`${baseURL}/suggestions`)
    url.search = new URLSearchParams(params).toString()

    const response = await fetch(url.toString())
    const data = await response.json()

    const { error, suggestions } = data
    if (error) {
      throw new Error(error)
    }

    return suggestions
  } catch (err) {
    toastr.error(err.message)
    throw err
  }
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
  try {
    const url = new URL(`${baseURL}/directions`)
    url.search = new URLSearchParams({
      destinationPlaceId,
      originLat: String(originLat),
      originLng: String(originLng),
    }).toString()

    const response = await fetch(url.toString())
    const data = await response.json()

    const { error, points } = data
    if (error) {
      throw new Error(error)
    }
    return points
  } catch (err) {
    toastr.error(err.message)
    throw err
  }
}
