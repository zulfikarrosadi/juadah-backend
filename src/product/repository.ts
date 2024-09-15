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
}

export default ProductRepository
