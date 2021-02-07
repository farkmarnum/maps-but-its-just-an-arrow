import { FunctionalComponent, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import * as toastr from 'toastr'
import WhereTo from './where-to'
import { getSuggestions, getDirections } from '../helpers/api'
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
  const [points, setPoints] = useState<number[][] | undefined>(undefined)

  const [userLocation, setUserLocation] = useState<number[] | undefined>(
    undefined,
  )

  useEffect(() => {
    getLocation()
      .then((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
      })
      .catch((err) => console.error(err))

    // window.addEventListener("deviceorientation", handleOrientationChange, true);
    // return () => {
      // window.removeEventListener("deviceorientation", handleOrientationChange, true);
    // }
  }, [])

  useEffect(() => {
    if (input) {
      getSuggestions(input)
        .then((newSuggestions: Suggestion[]) => {
          setSuggestions(newSuggestions)
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }, [input])

  useEffect(() => {
    if (placeId) {
      if (!userLocation) {
        toastr.error(
          'Error!',
          "Can't navigate, because we can't find your current location.",
        )
        return
      }

      getDirections({
        destinationPlaceId: placeId,
        originLat: userLocation[0],
        originLng: userLocation[1],
      })
        .then((newPoints: number[][]) => {
          setPoints(newPoints)
          setCurrentPage(ARROW)
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }, [placeId])

  return (
    <div id="app">
      <div className="top-right">
        {userLocation ? (
          <LocationPin />
        ) : (
          <div className="loading">loading gps</div>
        )}
      </div>
      {currentPage === WHERE_TO && (
        <WhereTo
          setInput={setInput}
          suggestions={suggestions}
          setPlaceId={setPlaceId}
        />
      )}
      {currentPage === ARROW && 'arrow (TODO!)'}
    </div>
  )
}

export default App
