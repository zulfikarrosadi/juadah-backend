import type { NextFunction, Request, Response } from 'express'
import type { AnyZodObject } from 'zod'
import type ApiResponse from '../schema'
import type { FailResponse, SuccessResponse } from '../schema'

export function validateInput(schema: AnyZodObject) {
  return async (
    req: Request,
    res: Response<ApiResponse<SuccessResponse, FailResponse>>,
    next: NextFunction,
  ) => {
    try {
      schema.parse(req.body)
      return next()
    } catch (error: any) {
      return res.status(400).send({
        status: 'fail',
        errors: {
          message: 'validation errors',
          code: 400,
          details: error.errors
            .map((e: { path: any; message: string }) => {
              return {
                [e.path[0]]: e.message,
              }
            })
            .reduce((acc: any, curr: any) => {
              Object.assign(acc, curr)
              return acc
            }, {}),
        },
      })
    }
  }
}
