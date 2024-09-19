import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { NotFoundError, ServerError } from '../lib/Error'
import type { CreateProduct, Product } from './schema'

class ProductRepository {
  constructor(private db: Pool) {}

  async createProduct(data: CreateProduct) {
    console.log('product repo create: ', data)

    const [rows] = await this.db.execute(
      'INSERT INTO products (name, description, price, images) VALUES(?,?,?,?)',
      [data.name, data.description, data.price, data.images || ['']],
    )

    const result = rows as ResultSetHeader
    if (!result.affectedRows) {
      throw new ServerError(
        "fail to create product, this is not your fault and we're working on this. please try again later",
      )
    }

    return { affectedRows: result.affectedRows, id: result.insertId }
  }

  async getProductById(id: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, name, description, price, images FROM products WHERE id = ?',
      [id],
    )
    if (!rows.length) {
      throw new NotFoundError(
        'product not found, enter the correct information and try again',
      )
    }
    return rows[0] as unknown as Product
  }

  async getProducts(lastProductId?: number) {
    if (lastProductId) {
      const [rows] = await this.db.query<RowDataPacket[]>(
        'SELECT id, name, description, price, images FROM products WHERE id > ? ORDER BY id ASC LIMIT 30',
        [lastProductId],
      )
      if (!rows.length) {
        throw new NotFoundError('no products found')
      }
      return rows as unknown as Product[]
    }
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, name, description, price, images FROM products ORDER BY id ASC LIMIT 30',
    )
    if (!rows.length) {
      throw new NotFoundError('no products found')
    }
    return rows as unknown as Product[]
  }

  async deleteProductById(id: number) {
    const [rows] = await this.db.execute('DELETE FROM products WHERE id = ?', [
      id,
    ])
    const result = rows as ResultSetHeader
    if (!result.affectedRows) {
      throw new NotFoundError(
        "you are trying to delete the product that does'nt exists",
      )
    }

    return { affectedRows: result.affectedRows }
  }
}

export default ProductRepository
