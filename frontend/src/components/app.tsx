import { FunctionalComponent, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import WhereTo from './where-to'
import Arrow from './arrow'
import { getSuggestions } from '../helpers/api'
import { getLocation } from '../helpers/location'
import LocationPin from './locationPin'

const WHERE_TO = 'where-to'
const ARROW = 'arrow'

const App: FunctionalComponent = () => {
  const [currentPage, setCurrentPage] = useState(WHERE_TO)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[] | undefined>(
    undefined,
  )

  const [placeId, setPlaceId] = useState<string | undefined>(undefined)

  const [userLocation, setUserLocation] = useState<number[] | undefined>(
    undefined,
  )

  useEffect(() => {
    const onSuccess = (pos: Record<string, any>) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude])
    }

    const onError = (err: GeolocationPositionError) => {
      console.error(err)
    }

    let locationWatcher: number | undefined

    getLocation()
      .then((pos) => {
        onSuccess(pos)
        locationWatcher = navigator.geolocation.watchPosition(
          onSuccess,
          onError,
        )
      })
      .catch((err) => console.error(err))

    return () => {
      if (locationWatcher !== undefined) {
        navigator.geolocation.clearWatch(locationWatcher)
      }
    }
  }, [])

  useEffect(() => {
    if (input) {
      getSuggestions({
        input,
        location: userLocation as [number, number] | undefined,
      })
        .then((newSuggestions: Suggestion[]) => {
          setSuggestions(newSuggestions)
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      setSuggestions([])
    }
  }, [input])

  return (
    <div id="app">
      <div className="top-right">{userLocation && <LocationPin />}</div>
      {currentPage === WHERE_TO && (
        <WhereTo
          key={WHERE_TO}
          setInput={setInput}
          suggestions={suggestions}
          setPlaceId={setPlaceId}
          goToArrow={() => {
            setCurrentPage(ARROW)
          }}
        />
      )}
      {currentPage === ARROW && (
        <Arrow
          key={ARROW}
          placeId={placeId}
          goBack={() => {
            setCurrentPage(WHERE_TO)
            setSuggestions([])
            setPlaceId(undefined)
          }}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}

export default App
