import cookieParser from 'cookie-parser'
import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import swaggerUI from 'swagger-ui-express'
import sanitizeInput from './middlewares/sanitizeInput'
const app = express()
import swaggerDocument from './openapi.json'
import routes from './routes'

const port = process.env.SERVER_PORT

BigInt.prototype.toJSON = function () {
  return this.toString()
}

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(sanitizeInput)
app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use('/api/', routes)
app.listen(port, () => {
  console.info(`Server running at port ${port}`)
})

export default app
