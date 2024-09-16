import type ApiResponse from '../schema'
import type { CreateProduct, Product } from './schema'

interface ProductRepository {
  createProduct(
    data: CreateProduct,
  ): Promise<{ id: number; affectedRows: number }>
  getProductById(id: number): Promise<Product>
  getProducts(lastProductId?: number): Promise<Product[]>
}

class ProductService {
  constructor(private repo: ProductRepository) {}

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
    } catch (error) {
      console.log('product service error: ', error)

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
    } catch (error) {
      return {
        status: 'fail',
        errors: {
          code: 404,
          message: error.message || error,
        },
      }
    }
  }
}

export default ProductService
