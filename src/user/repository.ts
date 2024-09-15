import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { EmailAlreadyExistsError, ServerError } from '../lib/Error'
import type { CreateUser } from './schema'

class UserRepository {
  private USER_ALREADY_EXISTS = 1062
  private ER_BAD_DB_ERROR = 'ER_BAD_DB_ERROR'
  constructor(private db: Pool) {}

  async createUser(data: CreateUser) {
    try {
      const [rows] = await this.db.execute(
        'INSERT INTO users (fullname, email, password) VALUES (?,?,?)',
        [data.fullname, data.email, data.password],
      )
      const result = rows as ResultSetHeader

      return { userId: result.insertId }
    } catch (error: any) {
      if (error.errno === this.USER_ALREADY_EXISTS) {
        throw new EmailAlreadyExistsError()
      }
      if (error.code && error.code === this.ER_BAD_DB_ERROR) {
        throw new ServerError(
          "error while creating the account, this is not your fault, we're working on it. please try again later",
        )
      }
      throw new Error(error)
    }
  }

  async getUserById(
    id: number,
  ): Promise<{ id: number; fullname: string; email: string }> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, fullname, email FROM users WHERE id = ?',
      [id],
    )

    if (!rows.length) {
      throw new Error('user not found')
    }

    return {
      id: rows[0]?.id,
      fullname: rows[0]?.fullname,
      email: rows[0]?.email,
    }
  }

  async saveTokenToDb(refreshToken: string, userId: number) {
    const [rows] = await this.db.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, userId],
    )
    const result = rows as ResultSetHeader
    return { affectedRows: result.affectedRows }
  }
}

export default UserRepository
