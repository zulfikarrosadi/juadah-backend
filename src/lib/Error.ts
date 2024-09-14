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

export class NotFoundError extends Error {}

export class ServerError extends Error {
  public code: number
  constructor(message: string) {
    super(message)
    this.code = 500
  }
}
