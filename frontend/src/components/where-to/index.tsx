import { h } from 'preact'
import { useState } from 'preact/hooks'
import { useDebouncedCallback } from 'use-debounce'
import style from './style.css'

const DEBOUNCE_DELAY_MS = 100

const WhereTo = ({
  setInput,
  suggestions,
  setPlaceId,
}: WhereToArgs): JSX.Element => {
  const [inputInner, setInputInner] = useState('')
  const debounced = useDebouncedCallback((value: string) => {
    setInput(value)
  }, DEBOUNCE_DELAY_MS)

  return (
    <div class={style.main}>
      <h1>Where to?</h1>
      <input
        value={inputInner}
        onInput={(evt) => {
          const target = evt.target as HTMLInputElement
          setInputInner(target.value)
          debounced.callback(target.value)
        }}
      />
      {suggestions && (
        <div className={style.suggestions}>
          {suggestions.map(({ description, place_id: placeId }) => (
            <button key={placeId} onClick={() => setPlaceId(placeId)}>
              {description}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default WhereTo
