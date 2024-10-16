import type { Express } from 'express'
import { loginSchema } from './auth/schema'
import { deserializeToken } from './middlewares/deserializeToken'
import requiredLogin from './middlewares/requiredLogin'
import { validateInput } from './middlewares/validateInput'
import { createUserSchema } from './user/schema'

import { PrismaClient } from '@prisma/client'
import connection from '../db/connection'
import AuthHandler from './auth/handler'
import AuthRepository from './auth/repository'
import AuthService from './auth/service'
import multer from './lib/upload'
import formDataParse from './middlewares/formDataParser'
import sanitizeInput from './middlewares/sanitizeInput'
import ProductHandler from './product/handler'
import ProductRepository from './product/repository'
import { createProduct, updateProduct } from './product/schema'
import ProductService from './product/service'
import UserHandler from './user/handler'

const prisma = new PrismaClient()

export default function routes(app: Express) {
  const authRepo = new AuthRepository(prisma)
  const authService = new AuthService(authRepo)
  const authHandler = new AuthHandler(authService)

  const userHandler = new UserHandler()

  const productRepo = new ProductRepository(connection)
  const productService = new ProductService(productRepo)
  const productHandler = new ProductHandler(productService)

  app.use(sanitizeInput)
  app.post(
    '/api/register',
    //@ts-ignore
    validateInput(createUserSchema),
    authHandler.registerUser,
  )
  app.post('/api/login', validateInput(loginSchema), authHandler.login)
  app.get('/api/refresh', authHandler.refreshToken)

  app.use(deserializeToken)
  app.use(requiredLogin)
  app.get('/api/users', userHandler.getCurrentUser)

  app.post(
    '/api/products',
    formDataParse(multer.array('images', 5)),
    validateInput(createProduct),
    productHandler.createProduct,
  )
  app.get('/api/products', productHandler.getProducts)
  app.put(
    '/api/products/:id',
    formDataParse(multer.array('images', 5)),
    validateInput(updateProduct),
    productHandler.updateProductById,
  )
}
