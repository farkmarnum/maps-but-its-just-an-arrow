import { h } from 'preact'
import { useEffect, useState, useRef } from 'preact/hooks'
import { useDebouncedCallback } from 'use-debounce'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'

const DEBOUNCE_DELAY_MS = 250

const placeholders = [
  'tell us tell us tell us',
  'tell us where!',
  "the name's nav... stupid nav",
  'where the heck are you going??',
  'you gotta type here. type it in!',
  'type here & the arrow will guide you',
  'get ready for some stupid nav',
  'where. are. you. going.',
  'you need to type something in here or nothing will happen',
]

const WhereTo = ({
  setInput,
  suggestions,
  setPlaceId,
  goToArrow,
}: WhereToArgs): JSX.Element => {
  const [inputInner, setInputInner] = useState('')
  const setInputDebounced = useDebouncedCallback((value: string) => {
    setInput(value)
  }, DEBOUNCE_DELAY_MS)

  useSetBgColorOnMount('var(--green)')

  const placeholder = useRef('')
  useEffect(() => {
    placeholder.current =
      placeholders[Math.floor(Math.random() * (placeholders.length - 1))]
  }, [])

  const setPlaceAndProceed = (placeId: string) => {
    setPlaceId(placeId)
    goToArrow()
  }

  const handleSuggestionClick = (placeId: string) => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === 'granted') {
            setPlaceAndProceed(placeId)
          } else {
            toastr.error('Device orientation permission required!')
          }
        })
        .catch(console.error)
    } else {
      setPlaceAndProceed(placeId)
    }
  }

  return (
    <div class={style.main}>
      <h1>where?</h1>
      <input
        value={inputInner}
        onInput={(evt) => {
          const target = evt.target as HTMLInputElement
          setInputInner(target.value)
          setInputDebounced.callback(target.value)
        }}
        placeholder={placeholder.current}
      />
      {suggestions && (
        <div className={style.suggestions}>
          {suggestions.map(({ description, place_id: placeId }) => (
            <button
              key={placeId}
              onClick={() => handleSuggestionClick(placeId)}
            >
              {description}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default WhereTo
