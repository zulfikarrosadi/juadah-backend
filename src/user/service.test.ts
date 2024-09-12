import { EmailAlreadyExistsError } from '../lib/Error'
import type UserRepository from './repository'
import UserSerivce from './service'

describe('user service', () => {
  let userRepo: jest.Mocked<UserRepository>
  let userService: UserSerivce
  const VALID_EMAIL = 'testing@email.com'
  const VALID_PASSWORD = 'password'
  const FULLNAME = 'testing'

  beforeEach(() => {
    userRepo = {
      USER_ALREADY_EXISTS: 1062,
      createUser: jest.fn(),
      getUserById: jest.fn(),
      saveTokenToDb: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>

    userService = new UserSerivce(userRepo)
  })

  describe('register user', () => {
    it('should register new user', async () => {
      userRepo.createUser.mockResolvedValue({ userId: 1 })
      userRepo.saveTokenToDb.mockResolvedValue({ affectedRows: 1 })
      userRepo.getUserById.mockResolvedValue({
        id: 1,
        fullname: FULLNAME,
        email: VALID_EMAIL,
      })
      const newUser = await userService.registerUser({
        fullname: FULLNAME,
        email: VALID_EMAIL,
        password: 'password',
      })

      expect(userRepo.createUser).toHaveBeenCalled()
      expect(newUser.response.status).toBe('success')
      expect(newUser.response.data.user.id).toBe(1)
      expect(newUser.response.data.user.email).toBe(VALID_EMAIL)
      expect(newUser).toHaveProperty('token')
      expect(newUser.token?.accessToken).not.toBeNull()
      expect(newUser.token?.refreshToken).not.toBeNull()
    })

    it('should fail: email already exists', async () => {
      userRepo.createUser.mockRejectedValue(new EmailAlreadyExistsError())
      const newUser = await userService.registerUser({
        email: 'already_exist_email',
        password: VALID_PASSWORD,
        fullname: FULLNAME,
      })

      expect(userRepo.createUser).toHaveBeenCalled()
      expect(newUser.response.status).toBe('fail')
      if (newUser.response.status === 'fail') {
        expect(newUser.response.errors.message).toBe(
          'this username already exists',
        )
      }
    })
  })

  describe('get user by id', () => {
    it('should fail: user not found cause bad user id', async () => {
      const user = await userService.getUserById('bad_user_id')
      expect(user.response.status).toBe('fail')
      if (user.response.status === 'fail') {
        expect(user.response.errors.message).toBe('user not found')
      }
    })

    it("should fail: user not found cause user id doesn't exist", async () => {
      userRepo.getUserById.mockRejectedValue('user not found')
      const user = await userService.getUserById('99999')

      expect(user.response.status).toBe('fail')
      if (user.response.status === 'fail') {
        expect(user.response.errors.message).toBe('user not found')
      }
    })

    it('should success', async () => {
      userRepo.getUserById.mockResolvedValue({
        id: 1,
        fullname: FULLNAME,
        email: VALID_EMAIL,
      })
      const user = await userService.getUserById('1')

      expect(user.response.status).toBe('success')
      expect(user.response.data.user.id).toBe(1)
      expect(user.response.data.user.username).toBe('testing_username')
    })
  })
})
