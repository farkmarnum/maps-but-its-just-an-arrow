// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

module.exports = () => [
  {
    url: '/',
    title: 'StupidNav',
    description: "Maps, but it's just a arrow",
    GA_TRACKING_ID: process.env.PREACT_APP_GOOGLE_ANALYTICS_TRACKING_ID,
  },
]
