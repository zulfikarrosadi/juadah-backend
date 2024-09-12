import type { Express } from 'express'
import { loginSchema } from './auth/schema'
import { deserializeToken } from './middlewares/deserializeToken'
import requiredLogin from './middlewares/requiredLogin'
import { validateInput } from './middlewares/validateInput'
import { createUserSchema } from './user/schema'

import connection from '../db/connection'
import AuthHandler from './auth/handler'
import AuthRepository from './auth/repository'
import AuthService from './auth/service'
import sanitizeInput from './middlewares/sanitizeInput'
import UserHandler from './user/handler'
import UserRepository from './user/repository'
import UserSerivce from './user/service'

export default function routes(app: Express) {
  const authRepo = new AuthRepository(connection)
  const authService = new AuthService(authRepo)
  const authHandler = new AuthHandler(authService)

  const userRepo = new UserRepository(connection)
  const userService = new UserSerivce(userRepo)
  const userHandler = new UserHandler(userService)

  app.use(sanitizeInput)
  app.post(
    '/api/register',
    //@ts-ignore
    validateInput(createUserSchema),
    userHandler.registerUser,
  )
  app.post('/api/login', validateInput(loginSchema), authHandler.login)
  app.get('/api/refresh', authHandler.refreshToken)

  app.use(deserializeToken)
  app.use(requiredLogin)
  app.get('/api/users', userHandler.getCurrentUser)
  app.get('/api/users/:id', userHandler.getUserById)
}
