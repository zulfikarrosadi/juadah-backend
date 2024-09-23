import type { Request, Response } from 'express'
import { accessTokenMaxAge, refreshTokenMaxAge } from '../lib/token'
import type ApiResponse from '../schema'
import type { Login, RegisterUser } from './schema'
import type { User } from './service'

interface AuthService {
  registerUser(data: RegisterUser): Promise<{
    response: ApiResponse<Omit<User, 'password'>>
    token?: { accessToken: string; refreshToken: string }
  }>
  login(data: Login): Promise<{
    response: ApiResponse<Omit<User, 'password'>>
    token?: { accessToken: string; refreshToken: string }
  }>
  refreshToken(token: string): Promise<{
    response: ApiResponse<Omit<User, 'password'>>
    token?: string
  }>
}

class AuthHandler {
  constructor(private service: AuthService) {}

  registerUser = async (
    req: Request<
      Record<string, unknown>,
      Record<string, unknown>,
      RegisterUser
    >,
    res: Response<ApiResponse<Omit<User, 'password'>>>,
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

  login = async (
    req: Request<Record<string, unknown>, Record<string, unknown>, Login>,
    res: Response,
  ) => {
    const { response, token } = await this.service.login({
      email: req.body.email,
      password: req.body.password,
    })
    if (response.status === 'fail') {
      return res.status(response.errors.code).json(response)
    }

    return res
      .status(200)
      .cookie('accessToken', token?.accessToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: accessTokenMaxAge,
      })
      .cookie('refreshToken', token?.refreshToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: refreshTokenMaxAge,
        path: '/api/refresh',
      })
      .json(response)
  }

  refreshToken = async (
    req: Request,
    res: Response<ApiResponse<Omit<User, 'password'>>>,
  ) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(400).json({
        status: 'fail',
        errors: {
          code: 400,
          message: 'invalid request, refresh token unavailable',
        },
      })
    }
    const { response, token } = await this.service.refreshToken(refreshToken)
    if (response.status === 'fail') {
      return res.status(response.errors.code).json(response)
    }

    return res
      .status(200)
      .cookie('accessToken', token, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: accessTokenMaxAge,
      })
      .cookie('refreshToken', refreshToken, {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: refreshTokenMaxAge,
        path: '/api/refresh',
      })
      .json(response)
  }
}

export default AuthHandler
