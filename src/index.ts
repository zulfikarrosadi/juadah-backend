import cookieParser from 'cookie-parser'
import express from 'express'
import routes from './routes'
import 'dotenv/config'
import cors from 'cors'

const app = express()
const port = process.env.SERVER_PORT

BigInt.prototype.toJSON = function () {
  return this.toString()
}

app.use(
  cors({
    credentials: true,
    origin: ['*'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(express.json())
app.use(cookieParser())

app.listen(port, () => {
  routes(app)
  console.info(`Server running at port ${port}`)
})
