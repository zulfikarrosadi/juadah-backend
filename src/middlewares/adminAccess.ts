import type { NextFunction, Request, Response } from 'express'
import type ApiResponse from '../schema'
import type { UserInToken } from '../schema'

function adminAccess(
  _: Request,
  res: Response<ApiResponse, { user: UserInToken }>,
  next: NextFunction,
) {
  console.log('user role in adminAccess middleware: ', res.locals.user)
  if (res.locals.user.role !== 'ADMIN') {
    return res.status(403).json({
      status: 'fail',
      errors: {
        code: 403,
        message: 'this action is only for user with admin access',
      },
    })
  }

  return next()
}

export default adminAccess
