import type { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import {
  AuthCredentialError,
  EmailAlreadyExistsError,
  NotFoundError,
  ServerError,
} from '../lib/Error'
import type { RegisterUser } from './schema'

class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  private USER_ALREADY_EXISTS = 'P2002'

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
          fullname: true,
        },
      })
      return newUser
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === this.USER_ALREADY_EXISTS
      ) {
        throw new EmailAlreadyExistsError()
      }
      console.log(error)

      throw new ServerError(
        "error while creating the account, this is not your fault, we're working on it. please try again later",
      )
    }
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        password: true,
      },
    })
    if (!user) {
      throw new AuthCredentialError()
    }
    return user
  }

  async saveTokenToDb(token: string, userId: bigint) {
    await this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token: token,
      },
    })

    return { affectedRows: 1 }
  }

  async getTokenByEmail(email: string) {
    const refreshToken = await this.prisma.users.findUnique({
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
  }
}

export default AuthRepository
