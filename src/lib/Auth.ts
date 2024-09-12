import { compare, hash } from 'bcrypt'
import {
  accessTokenMaxAge,
  createNewToken,
  refreshTokenMaxAge,
  verifyToken,
} from './token'

export class Auth {
  protected async verifyPassword(data: string | Buffer, encrypted: string) {
    return await compare(data, encrypted)
  }

  protected async hashPassword(password: string | Buffer) {
    return await hash(password, 10)
  }

  protected createAccessToken(data: {
    fullname: string
    userId: number
    email: string
  }) {
    return createNewToken({
      fullname: data.fullname,
      email: data.email,
      userId: data.userId,
      expiration: accessTokenMaxAge,
    })
  }

  protected createRefreshToken(data: {
    fullname: string
    email: string
    userId: number
  }) {
    return createNewToken({
      fullname: data.fullname,
      userId: data.userId,
      email: data.email,
      expiration: refreshTokenMaxAge,
    })
  }

  protected verifyToken(token: string) {
    return verifyToken(token)
  }
}
