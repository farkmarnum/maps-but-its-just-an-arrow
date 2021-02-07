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
}
