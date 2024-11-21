import type { NextFunction, Request, Response } from 'express'

export default function formDataParse(multer: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    multer(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({
          status: 'fail',
          errors: {
            code: 400,
            message: 'validation errors',
            details: {
              [err.fieldname]: err.message,
            },
          },
        })
      }
      return next()
    })
  }
}
