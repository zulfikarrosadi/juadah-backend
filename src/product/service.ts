import type ApiResponse from '../schema'
import type { CreateProduct, Product } from './schema'

interface ProductRepository {
  createProduct(
    data: CreateProduct,
  ): Promise<{ id: number; affectedRows: number }>
  getProductById(id: number): Promise<Product>
}

class ProductService {
  constructor(public repo: ProductRepository) {}

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
            image: result.image,
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
}

export default ProductService
