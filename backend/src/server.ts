import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cors from 'cors'
import { autocompletePlace, getPointsForRoute } from './helpers/maps'

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get('/', (_req: express.Request, res: express.Result) => {
  res.sendStatus(200)
})

app.get('/suggestions', async (req: express.Request, res: express.Result) => {
  try {
    const { input, location } = req.query

    const suggestions = await autocompletePlace(input, location)

    res.json({ suggestions })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.get('/directions', async (req: express.Request, res: express.Result) => {
  try {
    const { destinationPlaceId, originLat, originLng } = req.query

    const points = await getPointsForRoute({
      destinationPlaceId,
      originLat,
      originLng,
    })

    res.json({ points })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

const port = process.env.PORT
app.listen(port)

console.info(`Server running on port ${port}`)
