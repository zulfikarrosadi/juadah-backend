import type { Request, Response } from 'express'
import { accessTokenMaxAge, refreshTokenMaxAge } from '../lib/token'
import type ApiResponse from '../schema'
import type { CreateUser, User } from './schema'

interface UserService {
  registerUser(data: CreateUser): Promise<{
    response: ApiResponse<User>
    token?: { accessToken: string; refreshToken: string }
  }>
  getUserById(idFromUrlPath: string): Promise<{ response: ApiResponse<User> }>
}

class UserHandler {
  constructor(public service: UserService) {}

  registerUser = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, CreateUser>,
    res: Response<ApiResponse<User>>,
  ) => {
    const result = await this.service.registerUser({
      fullname: req.body.fullname,
      password: req.body.password,
      email: req.body.email,
    })
    if (result.response.status === 'fail') {
      return res.status(result.response.errors.code).json(result.response)
    }

    return res
      .status(201)
      .cookie('accessToken', result.token?.accessToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: accessTokenMaxAge,
      })
      .cookie('refreshToken', result.token?.refreshToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        path: '/api/refresh',
        maxAge: refreshTokenMaxAge,
      })
      .json(result.response)
  }

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
