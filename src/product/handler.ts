import type { Request, Response } from 'express'
import type ApiResponse from '../schema'
import type {
  CreateProduct,
  Product,
  UpdateProduct,
  UpdateProductDataService,
} from './schema'

interface ProductService {
  createProduct(data: CreateProduct): Promise<ApiResponse<Product>>
  getProducts(
    lastProductId?: string,
  ): Promise<ApiResponse<Record<string, unknown>>>
  updateProductById(
    id: string,
    data: UpdateProductDataService,
  ): Promise<ApiResponse<Product>>
  deleteProductById(id: string): Promise<ApiResponse<number>>
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
    let productPhotos: string[]
    if (req.files?.length) {
      productPhotos = req.files.map((file) => file.path)
    } else {
      productPhotos = ['']
    }

    const result = await this.service.createProduct({
      ...req.body,
      images: productPhotos,
    })
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.status(201).json(result)
  }

  getProducts = async (
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      Record<string, unknown>,
      { last_id?: string }
    >,
    res: Response,
  ) => {
    const result = await this.service.getProducts(req.query.last_id)
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.status(200).json(result)
  }

  updateProductById = async (
    req: Request<{ id: string }, Record<string, unknown>, UpdateProduct>,
    res: Response,
  ) => {
    let newProductPhotos: string[]
    if (req.files?.length) {
      newProductPhotos = req.files.map((file) => file.path)
    } else {
      newProductPhotos = ['']
    }

    const result = await this.service.updateProductById(req.params.id, {
      ...req.body,
      images: { removed: req.body.images.removed, new: newProductPhotos },
    })
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.status(200).json(result)
  }

  deleteProductById = async (req: Request<{ id: string }>, res: Response) => {
    const result = await this.service.deleteProductById(req.params.id)
    if (result.status === 'fail') {
      return res.status(404).json(result)
    }
    return res.sendStatus(204)
  }
}

export default ProductHandler
