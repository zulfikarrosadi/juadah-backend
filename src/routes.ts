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
import logger from './lib/logger'
import multer from './lib/upload'
import adminAccess from './middlewares/adminAccess'
import formDataParse from './middlewares/formDataParser'
import PaymentHandler from './payment/handler'
import PaymentRepository from './payment/repository'
import PaymentService from './payment/service'
import ProductHandler from './product/handler'
import ProductRepository from './product/repository'
import { createProduct, updateProduct } from './product/schema'
import ProductService from './product/service'
import UserHandler from './user/handler'

const prisma = new PrismaClient()
const authRepo = new AuthRepository(prisma, logger)
const authService = new AuthService(authRepo, logger)
const authHandler = new AuthHandler(authService)

const userHandler = new UserHandler()

const productRepo = new ProductRepository(prisma, logger)
const productService = new ProductService(productRepo, logger)
const productHandler = new ProductHandler(productService)

const paymentRepo = new PaymentRepository(prisma, logger)
const paymentService = new PaymentService(paymentRepo, logger)
const paymentHandler = new PaymentHandler(paymentService)

const router = Router()

router.post(
  '/register',
  //@ts-ignore
  validateInput(createUserSchema),
  authHandler.registerUser,
)
router.post('/login', validateInput(loginSchema), authHandler.login)
router.get('/refresh', authHandler.refreshToken)
router.post('/products/payments', paymentHandler.orderWebhook)

router.use(deserializeToken)
router.use(requiredLogin)
router.get('/users', userHandler.getCurrentUser)

router.post(
  '/products',
  formDataParse(multer.array('images', 5)),
  adminAccess,
  validateInput(createProduct),
  productHandler.createProduct,
)
router.get('/products', productHandler.getProducts)
router.put(
  '/products/:id',
  formDataParse(multer.array('images', 5)),
  adminAccess,
  validateInput(updateProduct),
  productHandler.updateProductById,
)
router.delete('/products/:id', productHandler.deleteProductById)
router.post('/products/:id/payments', paymentHandler.requestOrderToken)
router.get('/products/payments/:orderId', paymentHandler.checkOrderStatus)

export default router
