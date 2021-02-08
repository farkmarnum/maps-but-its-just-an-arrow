declare module '*.css' {
  const mapping: Record<string, string>
  export default mapping
}

interface Suggestion {
  description: string
  place_id: string
}

interface WhereToArgs {
  setInput: (arg0: string) => void
  suggestions: Suggestion[] | undefined
  setPlaceId: (arg0: string) => void
  goToArrow: () => void
}

interface ArrowArgs {
  userLocation: Point | undefined
  placeId: string | undefined
  goBack: () => void
}

type Point = [number, number]
type Region = Point[]

// FIXME: this shouldn't be needed
interface GeolocationPositionError {
  code: number
  message: string
  PERMISSION_DENIED: number
  POSITION_UNAVAILABLE: number
  TIMEOUT: number
}
