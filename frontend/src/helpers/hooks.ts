import { useEffect } from 'preact/hooks'

export const useSetBgColorOnMount = (color: string): void => {
  useEffect(() => {
    document.body.style.backgroundColor = color
    if (document.body.parentNode) {
      ;(document.body
        .parentNode as HTMLHtmlElement).style.backgroundColor = color
    }
  }, [])
}
