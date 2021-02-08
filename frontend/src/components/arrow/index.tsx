import { h, Fragment } from 'preact'
import { useState, useEffect, useCallback } from 'preact/hooks'
import { getDirections } from '../../helpers/api'
import { getNextPoint, getAngle } from '../../helpers/math'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'

const Arrow = ({ placeId, userLocation, goBack }: ArrowArgs): JSX.Element => {
  const [deviceAngle, setDeviceAngle] = useState<number | undefined>(undefined)
  const [points, setPoints] = useState<Point[] | undefined>(undefined)

  const handleOrientationChange = (evt: DeviceOrientationEvent) => {
    setDeviceAngle(evt.alpha ?? undefined)
  }

  // Listen for device orientation changes
  useEffect(() => {
    window.addEventListener('deviceorientation', handleOrientationChange, true)
    return () => {
      window.removeEventListener(
        'deviceorientation',
        handleOrientationChange,
        true,
      )
    }
  })

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
        .catch((err) => {
          console.error(err)
        })
    }
  }, [placeId, userLocation])

  useEffect(() => {
    if (!points) {
      getDirectionsAndSetPoints()
    }
  }, [getDirectionsAndSetPoints, points])

  const calculateNextPoint = useCallback(() => {
    // console.log('calculateNextPoint')
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
      <div className={style.reload}>
        <button onClick={getDirectionsAndSetPoints}>&#x21bb;</button>
      </div>
      <div className={style.main} style={{ display: 'none' }}>
        {!userLocation && 'Loading GPS...'}
        {userLocation && (
          <div>
            User location: {userLocation[0]}, {userLocation[1]}
          </div>
        )}
        {deviceAngle != null && <div>Device direction: {deviceAngle}</div>}
        {nextPoint && (
          <div>
            Next Point: {nextPoint[0]}, {nextPoint[1]}
          </div>
        )}
        {arrowAngle && <div>ARROW: {arrowAngle}</div>}
      </div>
      <div
        class={style.arrow}
        style={{
          transform: `rotate(${arrowAngle}deg)`,
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
