import type { PrismaClient } from '@prisma/client'
import { NotFoundError } from '../lib/Error'
import type { CreateProduct, FlattenUpdateProduct } from './schema'

class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async createProduct(data: CreateProduct) {
    const newProduct = await this.prisma.products.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        images: data.images || [''],
      },
    })

    return { affectedRows: 1, id: newProduct.id }
  }

  async getProductById(id: bigint) {
    const product = await this.prisma.products.findUnique({
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
    if (!product) {
      console.log('error repo', product)

      throw new NotFoundError(
        'product not found, enter the correct information and try again',
      )
    }
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images as string[],
    }
  }

  async getProducts(lastProductId?: number) {
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
      throw new NotFoundError('no products found')
    }
    return products
  }

  async deleteProductById(id: number) {
    const deletedProduct = await this.prisma.products.delete({
      where: {
        id: id,
      },
    })
    if (!deletedProduct) {
      throw new NotFoundError(
        "you are trying to delete the product that does'nt exists",
      )
    }

    return { affectedRows: 1 }
  }

  async updateProductById(id: bigint, data: FlattenUpdateProduct) {
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
    })
    if (!updatedProduct) {
      throw new Error(
        'failed to update product, enter the correct information and try again',
      )
    }

    return { affectedRows: 1, id: updatedProduct.id }
  }
}

export default ProductRepository
