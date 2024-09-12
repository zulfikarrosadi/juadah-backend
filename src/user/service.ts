import { Auth } from '../lib/Auth'
import type ApiResponse from '../schema'
import type { FailResponse, SuccessResponse } from '../schema'
import type { User } from './schema'

interface UserRepository {
  createUser(data: User): Promise<{ userId: number }>
  getUserById(id: number): Promise<Partial<User>>
  saveTokenToDb(
    refreshToken: string,
    userId: number,
  ): Promise<{ affectedRows: number }>
}

class UserSerivce extends Auth {
  constructor(public repo: UserRepository) {
    super()
  }

  public registerUser = async (
    data: User,
  ): Promise<{
    response: ApiResponse<SuccessResponse, FailResponse>
    token?: { accessToken: string; refreshToken: string }
  }> => {
    try {
      const newUser = await this.repo.createUser({
        fullname: data.fullname,
        email: data.email,
        password: await this.hashPassword(data.password),
      })

      const user = await this.repo.getUserById(newUser.userId)
      if (!user.email || !user.fullname || !user.password) {
        throw new Error('create user is fail, please try again')
      }

      const accessToken = this.createAccessToken({
        fullname: user.fullname,
        email: user.email,
        userId: newUser.userId,
      })
      const refreshToken = this.createRefreshToken({
        fullname: user.fullname,
        email: user.email,
        userId: newUser.userId,
      })
      await this.repo.saveTokenToDb(refreshToken, newUser.userId)
      return {
        response: {
          status: 'success',
          data: {
            user: {
              id: newUser.userId,
              fullname: user.fullname,
              email: user.email,
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
            code: 400,
            message: error.message,
          },
        },
      }
    }
  }

  public getUserById = async (
    idFromUrlPath: string,
  ): Promise<{ response: ApiResponse<SuccessResponse, FailResponse> }> => {
    try {
      const id = Number.parseInt(idFromUrlPath, 10)
      if (Number.isNaN(id)) {
        throw new Error('user not found')
      }
      const user = await this.repo.getUserById(id)
      return {
        response: {
          status: 'success',
          data: { user: { id, fullname: user.fullname } },
        },
      }
    } catch (error: any) {
      return {
        response: {
          status: 'fail',
          errors: { code: 404, message: error.message || error },
        },
      }
    }
  }
}

export default UserSerivce
