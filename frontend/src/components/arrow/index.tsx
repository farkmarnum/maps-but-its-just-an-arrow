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

const RECALC_COOLDOWN = 5000

const Arrow = ({
  placeId,
  userLocation,
  goBack,
  deviceAngle,
}: ArrowArgs): JSX.Element => {
  const [points, setPoints] = useState<Point[] | undefined>(undefined)

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
      <div className={style.recalculate}>
        <button disabled={recalculateIsDisabled} onClick={recalculate}>
          &#x21bb;
        </button>
      </div>
    </Fragment>
  )
}

export default Arrow
