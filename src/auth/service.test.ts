import { hashSync } from 'bcrypt'
import { AuthCredentialError, EmailAlreadyExistsError } from '../lib/Error'
import { createNewToken, refreshTokenMaxAge, verifyToken } from '../lib/token'
import type AuthRepository from './repository'
import AuthService from './service'

describe('auth service', () => {
  let authRepo: jest.Mocked<AuthRepository>
  let authService: AuthService
  const VALID_EMAIL = 'testing@email.com'
  const INVALID_EMAIL = 'nonexistent@email.com'
  const INVALID_PASSWORD = 'wrong password'
  const VALID_PASSWORD = 'password'
  const FULLNAME = 'testing'

  beforeEach(() => {
    authRepo = {
      createUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      saveTokenToDb: jest.fn(),
      getTokenByUserId: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>

    authService = new AuthService(authRepo)
  })

  describe('register user', () => {
    it('should register new user', async () => {
      authRepo.createUser.mockResolvedValue({
        id: BigInt(1),
        role: 'USER',
        email: VALID_EMAIL,
        fullname: FULLNAME,
      })
      authRepo.saveTokenToDb.mockResolvedValue({ affectedRows: 1 })
      authRepo.getUserByEmail.mockResolvedValue({
        id: BigInt(1),
        role: 'USER',
        password: '',
        fullname: FULLNAME,
        email: VALID_EMAIL,
      })
      const newUser = await authService.registerUser({
        fullname: FULLNAME,
        email: VALID_EMAIL,
        password: 'password',
      })

      expect(authRepo.createUser).toHaveBeenCalled()
      expect(newUser.response.status).toBe('success')
      expect(newUser).toHaveProperty('token')
      expect(newUser.response).toEqual({
        status: 'success',
        data: {
          user: { id: 1, email: VALID_EMAIL, fullname: FULLNAME },
        },
      })
      expect(newUser.token?.accessToken).not.toBeNull()
      expect(newUser.token?.refreshToken).not.toBeNull()
    })

    it('should fail: email already exists', async () => {
      authRepo.createUser.mockRejectedValue(new EmailAlreadyExistsError())
      const newUser = await authService.registerUser({
        email: 'already_exist_email',
        password: VALID_PASSWORD,
        fullname: FULLNAME,
      })

      expect(authRepo.createUser).toHaveBeenCalled()
      expect(newUser.response.status).toBe('fail')
      if (newUser.response.status === 'fail') {
        expect(newUser.response.errors.message).toBe(
          'this email already exists',
        )
      }
    })
  })

  describe('login', () => {
    it('should fail caused none existent user', async () => {
      authRepo.getUserByEmail.mockRejectedValue(new AuthCredentialError())

      const result = await authService.login({
        email: INVALID_EMAIL,
        password: 'password',
      })
      expect(result.response.status).toBe('fail')
    })

    it('should fail caused wrong password', async () => {
      authRepo.getUserByEmail.mockResolvedValue({
        id: BigInt(1),
        role: 'USER',
        fullname: FULLNAME,
        email: 'testing@email.com',
        password: hashSync(VALID_PASSWORD, 10),
      })

      const result = await authService.login({
        email: 'testing@email.com',
        password: INVALID_PASSWORD,
      })

      expect(authRepo.getUserByEmail).toHaveBeenCalled()
      expect(authRepo.getUserByEmail).toHaveBeenCalledWith(VALID_EMAIL)
      expect(result.response).toEqual({
        status: 'fail',
        errors: { code: 400, message: 'email or password is incorrect' },
      })
    })

    it('should success', async () => {
      authRepo.getUserByEmail.mockResolvedValue({
        id: BigInt(1),
        role: 'USER',
        fullname: FULLNAME,
        email: VALID_EMAIL,
        password: hashSync(VALID_PASSWORD, 10),
      })

      const result = await authService.login({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      })

      expect(authRepo.getUserByEmail).toHaveBeenCalled()
      expect(authRepo.getUserByEmail).toHaveBeenCalledWith(VALID_EMAIL)
      expect(result).toHaveProperty('response')
      expect(result).toHaveProperty('token')
      expect(result.response).toEqual({
        status: 'success',
        data: { user: { id: 1, email: VALID_EMAIL, fullname: FULLNAME } },
      })
    })
  })

  describe('refresh token', () => {
    it('should return new access token', async () => {
      const validRefreshToken = createNewToken({
        email: VALID_EMAIL,
        fullname: FULLNAME,
        role: 'USER',
        expiration: refreshTokenMaxAge,
      })
      authRepo.getTokenByEmail.mockResolvedValue(validRefreshToken)
      const result = await authService.refreshToken(validRefreshToken)
      expect(result).toHaveProperty('token')
      if (!result.token) {
        fail('should not reaching here: token is unavailable')
      }
      const { decodedData: accessToken } = verifyToken(result.token)
      expect(accessToken).toHaveProperty('email')
      expect(accessToken).toHaveProperty('userId')
      expect(accessToken?.userId).toBe(1)
      expect(accessToken?.email).toBe(VALID_EMAIL)
    })

    it('should fail caused invalid refresh token', async () => {
      const invalidToken = 'invalid token'
      const result = await authService.refreshToken(invalidToken)
      expect(result.response.status).toBe('fail')
      if (result.response.status === 'fail') {
        expect(result.response.errors.message).toBe('invalid refresh token')
      }
    })

    it('should fail caused token not found in db', async () => {
      const validRefreshToken = createNewToken({
        email: VALID_EMAIL,
        fullname: FULLNAME,
        role: 'USER',
        expiration: refreshTokenMaxAge,
      })
      authRepo.getTokenByEmail.mockRejectedValue('token not found in database')
      const result = await authService.refreshToken(validRefreshToken)

      expect(authRepo.getTokenByEmail).toHaveBeenCalled()
      expect(result).not.toHaveProperty('token')
      expect(result.response.status).toBe('fail')
      if (result.response.status === 'fail') {
        expect(result.response.errors.message).toBe(
          'token not found in database',
        )
      }
    })

    it('should fail caused token is not the same with in db', async () => {
      const tokenFromDb = createNewToken({
        email: VALID_EMAIL,
        fullname: FULLNAME,
        role: 'USER',
        expiration: refreshTokenMaxAge,
      })
      authRepo.getTokenByEmail.mockResolvedValue(tokenFromDb)

      const tokenFromUser = createNewToken({
        email: INVALID_EMAIL,
        fullname: FULLNAME,
        role: 'USER',
        expiration: refreshTokenMaxAge,
      })
      const result = await authService.refreshToken(tokenFromUser)

      expect(authRepo.getTokenByEmail).toHaveBeenCalled()
      expect(result).not.toHaveProperty('token')
      expect(result.response.status).toBe('fail')
      if (result.response.status === 'fail') {
        expect(result.response.errors.message).toBe('invalid refresh token')
      }
    })
  })
})
