import { useEffect } from 'preact/hooks'

export const useSetBgColorOnMount = (color: string): void => {
  useEffect(() => {
    document.documentElement.setAttribute(
      'style',
      `--main-background-color: ${color}`,
    )
  }, [])
}
