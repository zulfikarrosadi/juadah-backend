import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import {
  AuthCredentialError,
  EmailAlreadyExistsError,
  ServerError,
} from '../lib/Error'
import type { RegisterUser } from './schema'

type User = {
  email: string
  fullname: string
  id: number
  password: string
}

class AuthRepository {
  constructor(private db: Pool) {}

  private USER_ALREADY_EXISTS = 1062
  private ER_BAD_DB_ERROR = 'ER_BAD_DB_ERROR'

  async createUser(data: RegisterUser) {
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

  async getUserByEmail(email: string) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, email, fullname, password from users WHERE email = ?',
      [email],
    )

    if (!rows.length) {
      throw new AuthCredentialError()
    }
    const result = rows as unknown as User[]

    return {
      id: result[0]?.id,
      fullname: result[0]?.fullname,
      email: result[0]?.email,
      password: result[0]?.password,
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

  async saveTokenToDb(token: string, userId: number) {
    const [rows] = await this.db.execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [token, userId],
    )
    const result = rows as ResultSetHeader
    return { affectedRows: result.affectedRows }
  }

  async getTokenByUserId(userId: number) {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT refresh_token FROM users WHERE id = ?',
      [userId],
    )
    if (!rows.length) {
      throw new Error('token not found in database')
    }

    return rows[0]?.refresh_token as string
  }
}

export default AuthRepository
