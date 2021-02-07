import { h, Fragment } from 'preact'
import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import { getDirections } from '../../helpers/api'
import { getNearestPoint, getArrowAngle } from '../../helpers/math'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'

const Arrow = ({ placeId, userLocation, goBack }: ArrowArgs): JSX.Element => {
  const [deviceAngle, setDeviceAngle] = useState<number | undefined>(undefined)
  const [points, setPoints] = useState<number[][] | undefined>(undefined)
  const shouldGetDirections = useRef(true)

  const handleOrientationChange = (evt: DeviceOrientationEvent) => {
    setDeviceAngle(evt.alpha ?? undefined)
  }

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

  useSetBgColorOnMount('var(--blue)')

  useEffect(() => {
    if (placeId && userLocation && shouldGetDirections.current) {
      getDirections({
        destinationPlaceId: placeId,
        originLat: userLocation[0],
        originLng: userLocation[1],
      })
        .then((newPoints: number[][]) => {
          shouldGetDirections.current = false
          setPoints(newPoints)
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }, [placeId, userLocation, shouldGetDirections])

  console.info({ deviceAngle, userLocation, points })

  const calculateNearestPoint = useCallback(() => {
    if (deviceAngle != null && userLocation && points) {
      return getNearestPoint(points, userLocation)
    }
    return undefined
  }, [points, deviceAngle, userLocation])

  const nearestPoint = calculateNearestPoint()

  const navigationAngle =
    userLocation && nearestPoint
      ? getArrowAngle(userLocation, nearestPoint)
      : undefined

  const arrowAngle =
    navigationAngle && deviceAngle ? navigationAngle + deviceAngle : undefined

  return (
    <Fragment>
      <div className={style.close}>
        <button onClick={goBack}>&times;</button>
      </div>
      <div className={style.main}>
        {!userLocation && 'Loading GPS...'}
        {userLocation && (
          <div>
            User location: {userLocation[0]}, {userLocation[1]}
          </div>
        )}
        {deviceAngle != null && <div>Device direction: {deviceAngle}</div>}
        {nearestPoint && (
          <div>
            Nearest Point: {nearestPoint[0]}, {nearestPoint[1]}
          </div>
        )}
        {arrowAngle && <div>ARROW: {arrowAngle}</div>}
      </div>
      <div
        class={style.arrow}
        style={{ transform: `rotate(${arrowAngle}deg)` }}
      >
        <div class={style.line} />
        <div class={style.point} />
      </div>
    </Fragment>
  )
}

export default Arrow
