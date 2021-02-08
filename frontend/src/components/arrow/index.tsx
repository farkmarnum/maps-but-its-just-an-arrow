import { h, Fragment } from 'preact'
import { useState, useEffect, useCallback } from 'preact/hooks'
import { getDirections } from '../../helpers/api'
import {
  getNextPointUsingRegions,
  getNearestPoint,
  getAngle,
} from '../../helpers/math'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'
import BackIcon from '../back-icon'

const isDev = location.hostname === 'localhost'

const RECALC_COOLDOWN = 5000

interface IosOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

const Arrow = ({ placeId, userLocation, goBack }: ArrowArgs): JSX.Element => {
  const [deviceAngle, setDeviceAngle] = useState<number | undefined>(undefined)
  const [points, setPoints] = useState<Point[] | undefined>(undefined)

  const handleDeviceOrientationChange = (event: DeviceOrientationEvent) => {
    let angle: number | undefined = undefined

    const iosEvent = event as IosOrientationEvent
    if (iosEvent.webkitCompassHeading) {
      angle = iosEvent.webkitCompassHeading * -1
    } else if (event.absolute || isDev) {
      angle = event.alpha ?? undefined
    }

    if (angle !== undefined) {
      setDeviceAngle(angle)
    }
  }

  useEffect(() => {
    window.addEventListener(
      'deviceorientationabsolute',
      handleDeviceOrientationChange,
      false,
    )
    window.addEventListener(
      'deviceorientation',
      handleDeviceOrientationChange,
      false,
    )

    return () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        handleDeviceOrientationChange,
        false,
      )
      window.removeEventListener(
        'deviceorientation',
        handleDeviceOrientationChange,
        false,
      )
    }
  }, [])

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
    if (!points) {
      getDirectionsAndSetPoints()
    }
  }, [getDirectionsAndSetPoints, points])

  const [recalculateIsDisabled, setRecalculateIsDisabled] = useState(false)
  const recalculate = () => {
    if (!recalculateIsDisabled) {
      setRecalculateIsDisabled(true)
      getDirectionsAndSetPoints()
      setTimeout(() => {
        setRecalculateIsDisabled(false)
      }, RECALC_COOLDOWN)
    }
  }
  const calculateNextPoint = useCallback(() => {
    if (deviceAngle != null && userLocation && points) {
      return (
        getNextPointUsingRegions(points, userLocation) ||
        getNearestPoint(points, userLocation)
      )
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
        <button onClick={goBack}>
          <BackIcon />
        </button>
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
      <div className={style.recalculate}>
        <button disabled={recalculateIsDisabled} onClick={recalculate}>
          &#x21bb;
        </button>
      </div>
    </Fragment>
  )
}

export default Arrow
