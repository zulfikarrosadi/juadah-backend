import type { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { BadRequestError, NotFoundError, ServerError } from '../lib/Error'
import { type Logger, getContext } from '../lib/logger'
import type { CreateProduct, FlattenUpdateProduct } from './schema'

class ProductRepository {
  constructor(
    private prisma: PrismaClient,
    private logger: Logger,
  ) {}
  private RELATED_RECORD_NOT_EXIST = 'P2025'

  async createProduct(data: CreateProduct) {
    try {
      const newProduct = await this.prisma.products.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          images: data.images || [''],
        },
      })

      return { affectedRows: 1, id: newProduct.id }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'repository',
        'createProduct',
        context,
      )
      throw new ServerError(
        'fail to create product and this is not your fault, please try again later',
      )
    }
  }

  async getProductById(id: bigint) {
    try {
      const product = await this.prisma.products.findUniqueOrThrow({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          description: true,
          images: true,
          price: true,
        },
      })
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images as string[],
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        `product not found ${error.message || error}`,
        'repository',
        'getProductById',
        context,
      )
      throw new NotFoundError(
        'product not found, enter the correct information and try again',
      )
    }
  }

  async getProducts(lastProductId?: number) {
    const context = getContext()
    if (lastProductId) {
      const products = await this.prisma.products.findMany({
        take: 30,
        skip: 1,
        orderBy: {
          id: 'asc',
        },
        cursor: {
          id: lastProductId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          images: true,
        },
      })
      if (!products.length) {
        this.logger(
          'error',
          'no products found',
          'repository',
          'getProducts',
          context,
        )
        throw new NotFoundError('no products found')
      }
      return products
    }
    const products = await this.prisma.products.findMany({
      take: 30,
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
      },
    })

    if (!products.length) {
      this.logger(
        'error',
        'no products found',
        'repository',
        'getProducts',
        context,
      )
      throw new NotFoundError('no products found')
    }
    return products
  }

  async deleteProductById(id: bigint) {
    try {
      await this.prisma.products.delete({
        where: {
          id: id,
        },
      })

      return { affectedRows: 1 }
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            `delete product fail, product not found: ${error.message}`,
            'repository',
            'deleteProduct',
            context,
          )
          throw new NotFoundError(
            "you are trying to delete the product that does'nt exists",
          )
        }
      }
      this.logger(
        'error',
        `delete product fail, bad request: ${error.message}`,
        'repository',
        'deleteProduct',
        context,
      )
      throw new BadRequestError('delete product fail, please try again later')
    }
  }

  async updateProductById(id: bigint, data: FlattenUpdateProduct) {
    try {
      const updatedProduct = await this.prisma.products.update({
        where: {
          id: id,
        },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          images: data.images,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
        },
      })
      return { affectedRows: 1, ...updatedProduct }
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            `fail to update product, product not found ${error.message}`,
            'repository',
            'updateProductById',
            context,
          )
          throw new NotFoundError('fail to update product, product not found')
        }
      }
      this.logger(
        'error',
        `fail to update product, bad request: ${error.message || error}`,
        'repository',
        'updateProductById',
        context,
      )
      throw new BadRequestError(
        'failed to update product, enter the correct information and try again',
      )
    }
  }
}

export default ProductRepository
