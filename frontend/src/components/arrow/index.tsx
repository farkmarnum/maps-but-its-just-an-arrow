import { h, Fragment } from 'preact'
import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { getDirections } from '../../helpers/api'
import { getNextPoint, getAngle } from '../../helpers/math'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'

const DIRECTIONS_COOLDOWN = 1000

const Arrow = ({
  placeId,
  userLocation,
  goBack,
  deviceAngle,
}: ArrowArgs): JSX.Element => {
  const [points, setPoints] = useState<Point[] | undefined>(undefined)
  const getDirectionsWasRecentlyCalled = useRef(false)

  // Set bg color
  useSetBgColorOnMount('var(--blue)')

  const getDirectionsAndSetPoints = useCallback(() => {
    if (placeId && userLocation) {
      getDirections({
        destinationPlaceId: placeId,
        originLat: userLocation[0],
        originLng: userLocation[1],
      })
        .then((newPoints: Point[]) => {
          setPoints(newPoints)
        })
        .catch(console.error)
    }
  }, [placeId, userLocation])

  useEffect(() => {
    if (!nextPoint && !getDirectionsWasRecentlyCalled.current) {
      getDirectionsAndSetPoints()
      getDirectionsWasRecentlyCalled.current = true
      setTimeout(() => {
        getDirectionsWasRecentlyCalled.current = false
      }, DIRECTIONS_COOLDOWN)
    }
  }, [getDirectionsAndSetPoints, points, getDirectionsWasRecentlyCalled])

  const calculateNextPoint = useCallback(() => {
    if (deviceAngle != null && userLocation && points) {
      const nextPoint = getNextPoint(points, userLocation)
      return nextPoint
    }
    return undefined
  }, [points, deviceAngle, userLocation])

  const nextPoint = calculateNextPoint()

  const navigationAngle =
    userLocation && nextPoint ? getAngle(userLocation, nextPoint) : undefined

  const arrowAngle =
    navigationAngle && deviceAngle ? navigationAngle + deviceAngle : undefined

  return (
    <Fragment>
      <div className={style.close}>
        <button onClick={goBack}>&times;</button>
      </div>
      <div
        class={style.arrow}
        style={{
          transform: `rotateZ(${arrowAngle}deg)`,
          display: arrowAngle != null ? 'block' : 'none',
        }}
      >
        <div class={style.line} />
        <div class={style.point} />
      </div>
    </Fragment>
  )
}

export default Arrow
