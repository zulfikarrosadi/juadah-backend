import type { Request, Response } from 'express'
import type ApiResponse from '../schema'
import type { User } from './schema'

interface UserService {
  getUserById(idFromUrlPath: string): Promise<{ response: ApiResponse<User> }>
}

class UserHandler {
  constructor(public service: UserService) {}

  getUserById = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<User>>,
  ) => {
    const result = await this.service.getUserById(req.params.id)
    if (result.response.status === 'fail') {
      return res.status(result.response.errors.code).json(result.response)
    }

    return res.status(200).json(result.response)
  }

  getCurrentUser = async (
    req: Request,
    res: Response<
      ApiResponse<User>,
      { user: { fullname: string; userId: number; email: string } }
    >,
  ) => {
    return res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: res.locals.user.userId,
          fullname: res.locals.user.fullname,
          email: res.locals.user.email,
        },
      },
    })
  }
}

export default UserHandler
