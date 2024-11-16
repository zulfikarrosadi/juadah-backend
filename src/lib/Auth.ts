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
    email: string
    role: 'ADMIN' | 'USER'
  }) {
    return createNewToken({
      fullname: data.fullname,
      email: data.email,
      role: data.role,
      expiration: accessTokenMaxAge,
    })
  }

  protected createRefreshToken(data: {
    fullname: string
    role: 'ADMIN' | 'USER'
    email: string
  }) {
    return createNewToken({
      fullname: data.fullname,
      email: data.email,
      role: data.role,
      expiration: refreshTokenMaxAge,
    })
  }

  public generateOTP() {
    const otp = []
    for (let i = 0; i < 6; i++) {
      const randomNumber = Math.round(Math.random() * 9)
      otp.push(randomNumber)
    }
    return otp.join('')
  }

  protected verifyToken(token: string) {
    return verifyToken(token)
  }
}
