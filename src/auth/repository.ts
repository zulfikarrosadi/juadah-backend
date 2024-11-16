import type { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {
  AuthCredentialError,
  BadRequestError,
  EmailAlreadyExistsError,
  NotFoundError,
  ServerError,
} from '../lib/Error'
import { type Logger, getContext } from '../lib/logger'
import type { RegisterUser } from './schema'

class AuthRepository {
  constructor(
    private prisma: PrismaClient,
    private logger: Logger,
  ) {}

  private USER_ALREADY_EXISTS = 'P2002'
  private RELATED_RECORD_NOT_EXIST = 'P2025'

  async createUser(data: RegisterUser, refreshToken: string, otp: string) {
    try {
      const newUser = await this.prisma.users.create({
        data: {
          email: data.email,
          fullname: data.fullname,
          password: data.password,
          refresh_token: refreshToken,
          verification_token: otp,
        },
        select: {
          id: true,
          email: true,
          role: true,
          fullname: true,
        },
      })
      return newUser
    } catch (error: any) {
      const context = getContext()
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === this.USER_ALREADY_EXISTS
      ) {
        this.logger('error', error.message, 'repository', 'createUser', context)
        throw new EmailAlreadyExistsError()
      }
      this.logger(
        'error',
        error.message || error,
        'repository',
        'createUser',
        context,
      )
      throw new ServerError(
        "error while creating the account, this is not your fault, we're working on it. please try again later",
      )
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.prisma.users.findUniqueOrThrow({
        where: {
          email: email,
        },
        select: {
          id: true,
          email: true,
          fullname: true,
          role: true,
          password: true,
        },
      })

      return user
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            'email not found',
            'repository',
            'getUserByEmail',
            context,
          )
          throw new AuthCredentialError()
        }
      }

      this.logger(
        'error',
        error.message || error,
        'repository',
        'getUserByEmail',
        context,
      )
      throw new ServerError(
        'fail to proccess your request, this is not your fault, please try again later',
      )
    }
  }

  async saveTokenToDb(token: string, userId: bigint) {
    try {
      await this.prisma.users.update({
        where: {
          id: userId,
        },
        data: {
          refresh_token: token,
        },
      })

      return { affectedRows: 1 }
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            `fail to save refresh token to db: ${error.message}`,
            'repository',
            'saveTokenToDb',
            context,
          )
          throw new BadRequestError('fail to do this action, please try again')
        }
      }
      this.logger(
        'error',
        error.message || error,
        'repository',
        'saveTokenToDb',
        context,
      )
    }
  }

  async getTokenByEmail(email: string) {
    try {
      const refreshToken = await this.prisma.users.findUniqueOrThrow({
        where: {
          email: email,
        },
        select: {
          refresh_token: true,
        },
      })
      if (!refreshToken) {
        throw new NotFoundError(
          'searching refresh token based on user id is not found',
        )
      }

      return refreshToken.refresh_token
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            `get token failed not found ${error.message}`,
            'repository',
            'getTokenByEmail',
            context,
          )
          throw new NotFoundError('refresh token not found')
        }
      }
      this.logger(
        'error',
        error.message || error,
        'repository',
        'getTokenByEmail',
        context,
      )
      throw new BadRequestError('get refresh token failed, bad request')
    }
  }
}

export default AuthRepository
