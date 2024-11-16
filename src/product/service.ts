import type { JsonValue } from '@prisma/client/runtime/library'
import { NotFoundError } from '../lib/Error'
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
  deleteProductById(id: number): Promise<{ affectedRows: number }>
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
      const newProduct = await this.repo.createProduct(data)
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
    const parsedId = Number.parseInt(id, 10)
    try {
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
          message: error.message || error,
        },
      }
    }
  }

  updateProductById = async (
    id: string,
    data: UpdateProductDataService,
  ): Promise<ApiResponse<Product>> => {
    const parsedId = BigInt(id)
    try {
      if (Number.isNaN(parsedId)) {
        throw new NotFoundError(
          "you are trying to update the product that doesn't exists",
        )
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
        price: data.price,
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
