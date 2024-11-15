import { Router } from 'express'
import { loginSchema } from './auth/schema'
import { deserializeToken } from './middlewares/deserializeToken'
import requiredLogin from './middlewares/requiredLogin'
import { validateInput } from './middlewares/validateInput'
import { createUserSchema } from './user/schema'

import { PrismaClient } from '@prisma/client'
import AuthHandler from './auth/handler'
import AuthRepository from './auth/repository'
import AuthService from './auth/service'
import multer from './lib/upload'
import formDataParse from './middlewares/formDataParser'
import ProductHandler from './product/handler'
import ProductRepository from './product/repository'
import { createProduct, updateProduct } from './product/schema'
import ProductService from './product/service'
import UserHandler from './user/handler'

const prisma = new PrismaClient()
const authRepo = new AuthRepository(prisma)
const authService = new AuthService(authRepo)
const authHandler = new AuthHandler(authService)

const userHandler = new UserHandler()

const productRepo = new ProductRepository(prisma)
const productService = new ProductService(productRepo)
const productHandler = new ProductHandler(productService)

const router = Router()

router.post(
  '/register',
  //@ts-ignore
  validateInput(createUserSchema),
  authHandler.registerUser,
)
router.post('/login', validateInput(loginSchema), authHandler.login)
router.get('/refresh', authHandler.refreshToken)

router.use(deserializeToken)
router.use(requiredLogin)
router.get('/users', userHandler.getCurrentUser)

router.post(
  '/products',
  formDataParse(multer.array('images', 5)),
  validateInput(createProduct),
  productHandler.createProduct,
)
router.get('/products', productHandler.getProducts)
router.put(
  '/products/:id',
  formDataParse(multer.array('images', 5)),
  validateInput(updateProduct),
  productHandler.updateProductById,
)

export default router
