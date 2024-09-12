import type { NextFunction, Request, Response } from 'express'
import xssFilters from 'xss-filters'

function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  const sanitize = (input: any) => {
    if (typeof input === 'string') {
      return xssFilters.inHTMLData(input)
    }
    for (const key in input) {
      if (input.hasOwn(key)) {
        input[key] = sanitize(input[key])
      }
    }
    return input
  }

  req.body = sanitize(req.body)
  return next()
}

export default sanitizeInput
