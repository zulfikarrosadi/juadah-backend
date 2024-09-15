import { Auth } from '../lib/Auth'
import type ApiResponse from '../schema'
import type { CreateUser, User } from './schema'

interface UserRepository {
  createUser(data: CreateUser): Promise<{ userId: number }>
  getUserById(id: number): Promise<Partial<CreateUser>>
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
    data: CreateUser,
  ): Promise<{
    response: ApiResponse<User>
    token?: { accessToken: string; refreshToken: string }
  }> => {
    try {
      const newUser = await this.repo.createUser({
        fullname: data.fullname,
        email: data.email,
        password: await this.hashPassword(data.password),
      })

      const user = await this.repo.getUserById(newUser.userId)
      if (!user.email || !user.fullname) {
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
            code: typeof error.code === 'number' ? error.code : 400,
            message: error.message || error,
          },
        },
      }
    }
  }

  public getUserById = async (
    idFromUrlPath: string,
  ): Promise<{ response: ApiResponse<User> }> => {
    try {
      const id = Number.parseInt(idFromUrlPath, 10)
      if (Number.isNaN(id)) {
        throw new Error('user not found')
      }
      const user = await this.repo.getUserById(id)
      if (!user.email || !user.fullname) {
        throw new Error('create user is fail, please try again')
      }
      return {
        response: {
          status: 'success',
          data: { user: { id, fullname: user.fullname, email: user.email } },
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
