import type { Request, Response } from 'express'
import type ApiResponse from '../schema'
import type { CreateProduct, Product } from './schema'

interface ProductService {
  createProduct(data: CreateProduct): Promise<ApiResponse<Product>>
}

class ProductHandler {
  constructor(public service: ProductService) {}

  createProduct = async (
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      CreateProduct
    >,
    res: Response<ApiResponse<Product>>,
  ) => {
    const result = await this.service.createProduct(req.body)
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.status(201).json(result)
  }
}

export default ProductHandler
