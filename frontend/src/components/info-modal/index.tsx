import { h } from 'preact'
import style from './style.css'

interface InfoModalProps {
  infoIsShown: boolean
  setInfoIsShown: (arg0: boolean) => void
}

export default ({
  infoIsShown,
  setInfoIsShown,
}: InfoModalProps): JSX.Element => (
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
      If the arrow gets too wacky, press &#x21bb; to recalculate the directions.
    </p>
    <p>
      If there's no arrow, make sure you're using a mobile device. If there's
      still no arrow, try using Chrome. If there's still no arrow, open an issue
      on the{' '}
      <a
        href="https://github.com/farkmarnum/stupidnav"
        target="_blank"
        rel="noreferrer"
      >
        github page
      </a>
      .
    </p>
    <div style={{ margin: '3rem 0 0.5rem' }}>
      <hr />© Mark Farnum {new Date().getFullYear()}
    </div>
    <div className="funding">
      Like this tool? You can{' '}
      <a href="https://paypal.me/markfarnum" target="_blank" rel="noreferrer">
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
)
