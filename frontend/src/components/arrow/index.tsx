import { h, Fragment } from 'preact'
import { useState, useEffect, useCallback } from 'preact/hooks'
import { getDirections } from '../../helpers/api'
import {
  getNextPointUsingRegions,
  getNearestPoint,
  getAngle,
  getDistance,
} from '../../helpers/math'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'
import BackIcon from '../back-icon'
import InfoIcon from '../info-icon'

const isDev = location.hostname === 'localhost'

const RECALC_COOLDOWN = 5000

const Arrow = ({ placeId, userLocation, goBack }: ArrowArgs): JSX.Element => {
  const [deviceAngle, setDeviceAngle] = useState<number | undefined>(undefined)
  const [points, setPoints] = useState<Point[] | undefined>(undefined)
  const [infoIsShown, setInfoIsShown] = useState(false)

  const handleDeviceOrientationChange = (event: any) => {
    let angle: number | undefined = undefined

    if (event.webkitCompassHeading) {
      angle = event.webkitCompassHeading * -1
    } else if (event.absolute || isDev) {
      angle = event.alpha ?? undefined
    }

    if (angle !== undefined) {
      setDeviceAngle(angle)
    }
  }

  let recalcTimeout: NodeJS.Timeout | undefined

  const [recalculateIsDisabled, setRecalculateIsDisabled] = useState(false)
  const recalculate = () => {
    if (!recalculateIsDisabled) {
      setRecalculateIsDisabled(true)
      getDirectionsAndSetPoints()

      recalcTimeout = setTimeout(() => {
        setRecalculateIsDisabled(false)
        recalcTimeout = undefined
      }, RECALC_COOLDOWN)
    }
  }

  useEffect(() => {
    window.addEventListener(
      'deviceorientationabsolute',
      handleDeviceOrientationChange,
      true,
    )
    window.addEventListener(
      'deviceorientation',
      handleDeviceOrientationChange,
      true,
    )

    return () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        handleDeviceOrientationChange,
        true,
      )
      window.removeEventListener(
        'deviceorientation',
        handleDeviceOrientationChange,
        true,
      )

      if (recalcTimeout) {
        clearTimeout(recalcTimeout)
      }
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
      <div className={style.back}>
        <button onClick={goBack}>
          <BackIcon />
        </button>
      </div>
      <div className={style.main}>
        {nextPoint && location.search.includes('debug') && (
          <div>
            Next point: [{nextPoint[0]}, {nextPoint[1]}]
          </div>
        )}
        {nextPoint && userLocation && location.search.includes('debug') && (
          <div>Distance: {getDistance(nextPoint as Point, userLocation)}m</div>
        )}
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
      <div className={style.info}>
        <button
          onClick={() => {
            setInfoIsShown(true)
          }}
        >
          <InfoIcon />
        </button>
      </div>
      <div
        className={style.infoOverlay}
        style={{
          display: infoIsShown ? 'block' : 'none',
        }}
      >
        <div className={style.close}>
          <button
            onClick={() => {
              setInfoIsShown(false)
            }}
          >
            ×
          </button>
        </div>
        <h1>Stupid Nav</h1>
        <p>It's Google Maps, but just an arrow!</p>
        <p>
          If the arrow gets too wacky, press &#x21bb; to recalculate the
          directions.
        </p>
        <div style={{ marginTop: '3rem' }}>
          © Mark Farnum {new Date().getFullYear()}
        </div>
        <div className="funding">
          Like this tool? You can{' '}
          <a
            href="https://paypal.me/markfarnum"
            target="_blank"
            rel="noreferrer"
          >
            chip in
          </a>{' '}
          to pay for the server or{' '}
          <a
            href="https://github.com/farkmarnum/stupidnav"
            target="_blank"
            rel="noreferrer"
          >
            contribute
          </a>{' '}
          to improve the code.
        </div>
      </div>
    </Fragment>
  )
}

export default Arrow
