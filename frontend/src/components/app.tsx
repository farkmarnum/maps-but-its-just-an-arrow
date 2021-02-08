import { FunctionalComponent, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import WhereTo from './where-to'
import Arrow from './arrow'
import { getSuggestions } from '../helpers/api'
import { getLocation } from '../helpers/location'
import FullscreenIcon from './fullscreen-icon'
import CloseFullscreenIcon from './close-fullscreen-icon'

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

  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullscreenChange = () => {
    setIsFullscreen(document.fullscreenElement != null)
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange, true)
    handleFullscreenChange()

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange,
        true,
      )
    }
  }, [])

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
      .catch(console.error)

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
        .catch(console.error)
    } else {
      setSuggestions([])
    }
  }, [input])

  const goBack = () => {
    setCurrentPage(WHERE_TO)
    setSuggestions([])
    setPlaceId(undefined)
  }

  const isFullscreenSupported = () =>
    typeof window !== 'undefined' &&
    typeof document.body.requestFullscreen !== 'undefined'

  return (
    <div id="app">
      <div className="top-right">
        {isFullscreenSupported() && (
          <button className="fullscreen" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <CloseFullscreenIcon key="close-fullscreen" />
            ) : (
              <FullscreenIcon key="open-fullscreen" />
            )}
          </button>
        )}
      </div>
      {currentPage === WHERE_TO && (
        <WhereTo
          setInput={setInput}
          suggestions={suggestions}
          setPlaceId={setPlaceId}
          goToArrow={() => {
            setCurrentPage(ARROW)
          }}
        />
      )}
      {currentPage === ARROW && (
        <Arrow placeId={placeId} goBack={goBack} userLocation={userLocation} />
      )}
    </div>
  )
}

export default App
