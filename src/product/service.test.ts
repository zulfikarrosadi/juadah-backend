import { ServerError } from '../lib/Error'
import type ProductRepository from './repository'
import type { CreateProduct, Product } from './schema'
import ProductService from './service'

describe('product service', () => {
  let productRepo: jest.Mocked<ProductRepository>
  let productService: ProductService
  const NEW_VALID_PRODUCT: CreateProduct = {
    name: 'cheese cake',
    description: 'cheese cake can make your day like sunday',
    price: 10000,
  }
  const PRODUCT: Product = {
    id: 1,
    name: 'cheese cake',
    description: 'cheese cake can make your day like sunday',
    price: 10000,
  }

  beforeEach(() => {
    productRepo = {
      createProduct: jest.fn(),
      getProductById: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>

    productService = new ProductService(productRepo)
  })

  describe('create product', () => {
    it('should fail to create product cause system error', async () => {
      productRepo.createProduct.mockRejectedValueOnce(
        new ServerError(
          "fail to create product, this is not your fault and we're working on this. please try again later",
        ),
      )

      const result = await productService.createProduct(NEW_VALID_PRODUCT)
      expect(result.status).toBe('fail')
      if (result.status === 'fail') {
        expect(result.errors.code).toBe(500)
        expect(result.errors.message).toBe(
          "fail to create product, this is not your fault and we're working on this. please try again later",
        )
      }
    })

    it('should success create new product', async () => {
      productRepo.createProduct.mockResolvedValueOnce({
        affectedRows: 1,
        id: 1,
      })
      productRepo.getProductById.mockResolvedValueOnce(PRODUCT)

      const result = await productService.createProduct(NEW_VALID_PRODUCT)
      expect(result.status).toBe('success')
      if (result.status === 'success') {
        expect(result.data.products).toEqual(PRODUCT)
      }
    })
  })
})
