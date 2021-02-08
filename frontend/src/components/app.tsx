import { FunctionalComponent, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import WhereTo from './where-to'
import Arrow from './arrow'
import { getSuggestions } from '../helpers/api'
import { getLocation } from '../helpers/location'
import LocationIcon from './location-icon'
import FullscreenIcon from './fullscreen-icon'

const WHERE_TO = 'where-to'
const ARROW = 'arrow'

const lockOrientation = async () => {
  try {
    await screen.orientation.lock('portrait')
  } catch (err) {
    if (!(err instanceof DOMException)) {
      console.error(err)
    }
  }
}

const toggleFullscreen = async () => {
  try {
    const elem = document.getElementById('app') as HTMLDivElement
    if (!document.fullscreenElement) {
      if (elem && elem.requestFullscreen) {
        await elem.requestFullscreen()
        lockOrientation()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  } catch (err) {
    console.error(err)
  }
}

const App: FunctionalComponent = () => {
  const [currentPage, setCurrentPage] = useState(WHERE_TO)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[] | undefined>(
    undefined,
  )

  const [placeId, setPlaceId] = useState<string | undefined>(undefined)

  const [userLocation, setUserLocation] = useState<Point | undefined>(undefined)

  useEffect(() => {
    const onSuccess = (pos: Record<string, any>) => {
      setUserLocation([
        Number(pos.coords.latitude),
        Number(pos.coords.longitude),
      ])
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

  const goBack = () => {
    setCurrentPage(WHERE_TO)
    setSuggestions([])
    setPlaceId(undefined)
  }

  return (
    <div id="app">
      <div className="top-right">
        <button className="fullscreen" onClick={toggleFullscreen}>
          <FullscreenIcon />
        </button>
      </div>
      <div className="bottom-right" style={{ opacity: 0.5 }}>
        {userLocation && <LocationIcon />}
      </div>
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
          goBack={goBack}
          userLocation={userLocation}
        />
      )}
    </div>
  )
}

export default App
