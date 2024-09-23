import { Auth } from '../lib/Auth'
import type ApiResponse from '../schema'
import type { CreateUser, User } from './schema'

interface UserRepository {
  getUserById(id: number): Promise<Partial<CreateUser>>
}

class UserSerivce extends Auth {
  constructor(public repo: UserRepository) {
    super()
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
