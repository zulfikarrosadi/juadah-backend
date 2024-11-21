import { ServerError } from '../lib/Error'
import logger from '../lib/logger'
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
    id: 1n,
    name: 'cheese cake',
    description: 'cheese cake can make your day like sunday',
    price: 10000,
    images: ['image-1.png'],
  }
  const PRODUCTS: Product[] = [
    {
      id: 1n,
      name: 'cheese cake',
      description: 'cheese cake can make your day like sunday',
      price: 10000,
      images: ['image-1.png'],
    },
    {
      id: 30n,
      name: 'chocolate cake',
      description: 'chocolate cake can make your day great',
      price: 10000,
      images: ['image-1.png'],
    },
  ]

  beforeEach(() => {
    productRepo = {
      createProduct: jest.fn(),
      getProductById: jest.fn(),
      getProducts: jest.fn(),
      deleteProductById: jest.fn(),
    } as unknown as jest.Mocked<ProductRepository>

    productService = new ProductService(productRepo, logger)
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
        id: 1n,
      })
      // @ts-ignore
      productRepo.getProductById.mockResolvedValueOnce(PRODUCT)

      const result = await productService.createProduct(NEW_VALID_PRODUCT)
      expect(result.status).toBe('success')
      if (result.status === 'success') {
        expect(result.data.products).toEqual(PRODUCT)
      }
    })
  })
  describe('get products', () => {
    it('should fail cause on products found', async () => {
      productRepo.getProducts.mockRejectedValue('no products found')

      const result = await productService.getProducts()
      expect(result.status).toBe('fail')
      if (result.status !== 'fail') {
        fail('get products response status return another than fail')
      }
      expect(result.errors.code).toBe(404)
      expect(result.errors.message).toBe('no products found')
    })

    it('should return first 30 products', async () => {
      // @ts-ignore
      productRepo.getProducts.mockResolvedValueOnce(PRODUCTS)

      const result = await productService.getProducts()
      expect(result.status).toBe('success')
      if (result.status !== 'success') {
        fail('product service return fail expected success')
      }
      expect(result.data?.meta?.lastProductId).toBe(30n)
      expect(result.data?.products?.length).toBe(2)
    })
    it('should return 30 products after the last id', async () => {
      productRepo.getProducts.mockResolvedValueOnce([
        {
          id: 30n,
          name: 'choco',
          description: 'choco cake',
          images: ['image-1.png'],
        },
      ])

      const result = await productService.getProducts('1')
      expect(result.status).toBe('success')
      if (result.status !== 'success') {
        fail('product service status return other than success')
      }
      expect(result.data?.meta?.lastProductId).toBe(30n)
      expect(result.data?.products.length).toBe(1)
    })
  })
})
