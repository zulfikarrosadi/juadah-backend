import type { JsonValue } from '@prisma/client/runtime/library'
import {
  BadRequestError,
  CustomValidationError,
  NotFoundError,
} from '../lib/Error'
import { type Logger, getContext } from '../lib/logger'
import type ApiResponse from '../schema'
import type {
  CreateProduct,
  FlattenUpdateProduct,
  Product,
  UpdateProductDataService,
} from './schema'

interface ProductRepository {
  createProduct(
    data: CreateProduct,
  ): Promise<{ id: bigint; affectedRows: number }>
  getProductById(id: bigint): Promise<{
    name: string
    description: string
    images: string[]
    id: bigint
    price: number
  }>
  getProducts(lastProductId?: number): Promise<
    {
      name: string
      description: string
      images: JsonValue
      id: bigint
    }[]
  >
  deleteProductById(id: bigint): Promise<{ affectedRows: number }>
  updateProductById(
    id: bigint,
    data: FlattenUpdateProduct,
  ): Promise<{ affectedRows: number; id: bigint }>
}

class ProductService {
  constructor(
    private repo: ProductRepository,
    private logger: Logger,
  ) {}

  createProduct = async (
    data: CreateProduct,
  ): Promise<ApiResponse<Product>> => {
    try {
      let priceInFloat: undefined | number
      if (typeof data.price === 'string') {
        priceInFloat = Number.parseFloat(data.price)
      } else {
        priceInFloat = data.price
      }
      if (Number.isNaN(priceInFloat) || !priceInFloat) {
        const context = getContext()
        this.logger(
          'error',
          'price parsing faiil',
          'service',
          'createProduct',
          context,
        )
        throw new BadRequestError(
          'fail to create product, make sure to insert correct information and try again',
        )
      }
      const newProduct = await this.repo.createProduct({
        ...data,
        price: priceInFloat,
      })
      const result = await this.repo.getProductById(newProduct.id)

      return {
        status: 'success',
        data: {
          products: {
            id: result.id,
            name: result.name,
            description: result.description,
            price: result.price,
            images: result.images,
          },
        },
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'service',
        'createProduct',
        context,
      )
      return {
        status: 'fail',
        errors: {
          code: error.code,
          message: error.message || error,
        },
      }
    }
  }

  getProducts = async (lastProductId?: string): Promise<ApiResponse<any>> => {
    let productId: number | undefined
    if (lastProductId) {
      const parsedProductId = Number.parseInt(lastProductId, 10)
      productId = parsedProductId ? parsedProductId : undefined
    }
    try {
      const result = await this.repo.getProducts(productId)
      return {
        status: 'success',
        data: {
          meta: { lastProductId: result[result.length - 1]?.id },
          products: result,
        },
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'service',
        'getProducts',
        context,
      )
      return {
        status: 'fail',
        errors: {
          code: 404,
          message: error.message || error,
        },
      }
    }
  }

  deleteProductById = async (id: string): Promise<ApiResponse<number>> => {
    try {
      const parsedId = BigInt(id)
      if (Number.isNaN(parsedId)) {
        throw new NotFoundError(
          "you are trying to delete the product that does'nt exists",
        )
      }
      const result = await this.repo.deleteProductById(parsedId)
      return {
        status: 'success',
        data: {
          affectedRows: result.affectedRows,
        },
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'service',
        'deleteProductById',
        context,
      )
      return {
        status: 'fail',
        errors: {
          code: 404,
          message: 'fail to delete product, product not found',
        },
      }
    }
  }

  updateProductById = async (
    id: string,
    data: UpdateProductDataService,
  ): Promise<ApiResponse<Product>> => {
    try {
      const parsedId = BigInt(id)
      if (Number.isNaN(parsedId)) {
        throw new NotFoundError(
          "you are trying to update the product that doesn't exists",
        )
      }
      let priceInFloat: undefined | number
      if (typeof data.price === 'string') {
        priceInFloat = Number.parseFloat(data.price)
      } else {
        priceInFloat = data.price
      }
      if (Number.isNaN(priceInFloat) || !priceInFloat) {
        const context = getContext()
        this.logger(
          'error',
          'price parsing faiil',
          'service',
          'createProduct',
          context,
        )
        throw new CustomValidationError('price should be number', 'price')
      }

      const oldProduct = await this.repo.getProductById(parsedId)
      const allImages = [
        ...new Set([...data.images.new, ...(oldProduct.images || '')]),
      ]
      const finalImages = allImages
        .filter((image) => !data.images.removed.includes(image))
        .filter(Boolean)
      if (finalImages.length > 5) {
        throw new Error('each product can only have 5 images at max')
      }
      const updatedProduct = await this.repo.updateProductById(parsedId, {
        name: data.name,
        description: data.description,
        price: priceInFloat,
        images: finalImages,
      })

      return {
        status: 'success',
        data: {
          products: {
            id: updatedProduct.id,
            name: data.name,
            description: data.description,
            price: data.price,
            images: finalImages,
          },
        },
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'service',
        'updateProductById',
        context,
      )
      if (error instanceof CustomValidationError) {
        return {
          status: 'fail',
          errors: {
            code: 400,
            message: 'validation errors',
            details: {
              [error.fieldname]: error.message,
            },
          },
        }
      }
      if (error instanceof SyntaxError) {
        return {
          status: 'fail',
          errors: {
            code: 404,
            message: 'fail to update product, product not found',
          },
        }
      }
      return {
        status: 'fail',
        errors: {
          code: error.code || 400,
          message: error.message || error,
        },
      }
    }
  }
}

export default ProductService
