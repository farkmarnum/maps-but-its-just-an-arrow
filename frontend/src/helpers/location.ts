export const getLocation = (): Promise<any> =>
  new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve(pos)
        },
        (err) => {
          console.error(err)
          reject(err)
        },
      )
    } else {
      reject('The Geolocation API is not supported by your browser!')
    }
  })
