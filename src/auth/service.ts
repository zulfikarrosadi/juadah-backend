import { Auth } from '../lib/Auth'
import { AuthCredentialError } from '../lib/Error'
import type ApiResponse from '../schema'
import type { Login, RegisterUser } from './schema'

export interface User {
  id: bigint
  fullname: string
  email: string
  role: 'ADMIN' | 'USER'
  password: string
}

interface AuthRepository {
  createUser(
    data: RegisterUser,
    refreshToken: string,
    otp: string,
  ): Promise<{
    id: bigint
    fullname: string
    role: 'ADMIN' | 'USER'
    email: string
  }>
  getUserByEmail(email: string): Promise<Partial<User>>
  saveTokenToDb(
    token: string,
    userId: bigint,
  ): Promise<{ affectedRows: number }>
  getTokenByEmail(email: string): Promise<string | null>
}

class AuthService extends Auth {
  constructor(public repository: AuthRepository) {
    super()
  }

  async registerUser(data: RegisterUser): Promise<{
    response: ApiResponse<Omit<User, 'password'>>
    token?: { accessToken: string; refreshToken: string }
  }> {
    try {
      const accessToken = this.createAccessToken({
        fullname: data.fullname,
        role: 'USER',
        email: data.email,
      })
      const refreshToken = this.createRefreshToken({
        fullname: data.fullname,
        role: 'USER',
        email: data.email,
      })
      const otp = this.generateOTP()
      const newUser = await this.repository.createUser(
        {
          email: data.email,
          fullname: data.fullname,
          password: await this.hashPassword(data.password),
        },
        refreshToken,
        otp,
      )

      return {
        response: {
          status: 'success',
          data: {
            user: {
              id: newUser.id,
              role: newUser.role,
              fullname: newUser.fullname,
              email: newUser.email,
            },
          },
        },
        token: { accessToken, refreshToken },
      }
    } catch (error: any) {
      return {
        response: {
          status: 'fail',
          errors: {
            code: typeof error.code === 'number' ? error.code : 400,
            message: error.message || error,
          },
        },
      }
    }
  }

  async login(data: Login): Promise<{
    response: ApiResponse<Omit<User, 'password'>>
    token?: { accessToken: string; refreshToken: string }
  }> {
    try {
      const user = await this.repository.getUserByEmail(data.email)
      if (
        !user.password ||
        !user.email ||
        !user.id ||
        !user.role ||
        !user.fullname
      ) {
        throw new AuthCredentialError()
      }
      const isPasswordMatch = await this.verifyPassword(
        data.password,
        user.password,
      )
      if (!isPasswordMatch) {
        throw new AuthCredentialError()
      }

      const accessToken = this.createAccessToken({
        fullname: user.fullname,
        role: user.role,
        email: user.email,
      })
      const refreshToken = this.createRefreshToken({
        fullname: user.fullname,
        role: user.role,
        email: user.email,
      })
      this.repository.saveTokenToDb(refreshToken, user.id)

      return {
        response: {
          status: 'success',
          data: {
            user: {
              id: user.id,
              role: user.role,
              fullname: user.fullname,
              email: user.email,
            },
          },
        },
        token: { accessToken, refreshToken },
      }
    } catch (error: any) {
      if (error.code && error.code === 'ECONNREFUSED') {
        return {
          response: {
            status: 'fail',
            errors: {
              code: 500,
              message:
                'this is not your fault, something went wrong in our system, please try again later',
            },
          },
        }
      }
      return {
        response: {
          status: 'fail',
          errors: { code: 400, message: error.message },
        },
      }
    }
  }

  async refreshToken(token: string): Promise<{
    response: ApiResponse<Omit<User, 'password'>>
    token?: string
  }> {
    try {
      const { decodedData } = this.verifyToken(token)

      if (!decodedData) {
        throw new Error('invalid refresh token')
      }
      const tokenFromDb = await this.repository.getTokenByEmail(
        decodedData.email,
      )
      if (token !== tokenFromDb) {
        throw new Error('invalid refresh token')
      }
      const newAccessToken = this.createAccessToken({
        fullname: decodedData.fullname,
        role: decodedData.role,
        email: decodedData.email,
      })
      return {
        response: {
          status: 'success',
          data: {
            user: {
              id: decodedData.userId,
              role: decodedData.role,
              fullname: decodedData.fullname,
              email: decodedData.email,
            },
          },
        },
        token: newAccessToken,
      }
    } catch (error: any) {
      return {
        response: {
          status: 'fail',
          errors: {
            code: 400,
            message: error.message || error,
          },
        },
      }
    }
  }
}

export default AuthService
