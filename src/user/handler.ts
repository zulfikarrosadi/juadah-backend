import type { Request, Response } from 'express'
import type ApiResponse from '../schema'
import type { User } from './schema'

class UserHandler {
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
