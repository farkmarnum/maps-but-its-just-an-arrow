import { h } from 'preact'
import { useState } from 'preact/hooks'
import { useDebouncedCallback } from 'use-debounce'
import { useSetBgColorOnMount } from '../../helpers/hooks'
import style from './style.css'

const DEBOUNCE_DELAY_MS = 100

const placeholders = [
  'tell us tell us tell us',
  'tell us where!',
  "the name's nav... stupid nav",
  'where the heck are you going??',
  'you gotta type here. type it in!',
  'type here & the arrow will guide you',
  'get ready for some stupid nav',
]

const placeholder =
  placeholders[Math.floor(Math.random() * (placeholders.length - 1))]

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

  return (
    <div class={style.main}>
      <h1>where???????</h1>
      <input
        value={inputInner}
        onInput={(evt) => {
          const target = evt.target as HTMLInputElement
          setInputInner(target.value)
          setInputDebounced.callback(target.value)
        }}
        placeholder={placeholder}
      />
      {suggestions && (
        <div className={style.suggestions}>
          {suggestions.map(({ description, place_id: placeId }) => (
            <button
              key={placeId}
              onClick={() => {
                setPlaceId(placeId)
                goToArrow()
              }}
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
