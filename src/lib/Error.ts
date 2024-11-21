export class AuthCredentialError extends Error {
  constructor(message = 'email or password is incorrect') {
    super(message)
  }
}

export class EmailAlreadyExistsError extends Error {
  constructor(message = 'this email already exists') {
    super(message)
  }
}

export class NotFoundError extends Error {
  public code: number
  constructor(message: string) {
    super(message)
    this.code = 404
  }
}

export class BadRequestError extends Error {
  public code: number
  constructor(message: string) {
    super(message)
    this.code = 400
  }
}

export class ServerError extends Error {
  public code: number
  constructor(message: string) {
    super(message)
    this.code = 500
  }
}

/**
 * this is needed for image error validation and for create product price error validation
 * we receive multipart/form-data and every input is a string
 */
export class CustomValidationError extends Error {
  public fieldname: string
  constructor(message: string, fieldname: string) {
    super(message)
    this.fieldname = fieldname
  }
}
