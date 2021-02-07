import * as express from 'express'
import * as bodyParser from 'body-parser'
import { autocompletePlace, getPointsForRoute } from './helpers/maps'

const app = express()

app.use(bodyParser.json())

app.get('/', (_req: express.Request, res: express.Result) => {
  res.sendStatus(200)
})

app.get('/suggestions', async (req: express.Request, res: express.Result) => {
  try {
    const { input } = req.body

    const suggestions = await autocompletePlace(input)

    res.json({ suggestions })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

app.get('/directions', async (req: express.Request, res: express.Result) => {
  try {
    const { destinationPlaceId, originLat, originLng } = req.body

    const points = await getPointsForRoute({
      destinationPlaceId,
      originLat,
      originLng,
    })

    res.json({ points })
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

const port = process.env.PORT
app.listen(port)

console.info(`Server running on port ${port}`)
