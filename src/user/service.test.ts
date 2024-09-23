import type UserRepository from './repository'
import UserSerivce from './service'

describe('user service', () => {
  let userRepo: jest.Mocked<UserRepository>
  let userService: UserSerivce
  const VALID_EMAIL = 'testing@email.com'
  const FULLNAME = 'testing'

  beforeEach(() => {
    userRepo = {
      USER_ALREADY_EXISTS: 1062,
      createUser: jest.fn(),
      getUserById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>

    userService = new UserSerivce(userRepo)
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
      expect(user.response).toEqual({
        status: 'success',
        data: {
          user: {
            id: 1,
            email: VALID_EMAIL,
            fullname: FULLNAME,
          },
        },
      })
    })
  })
})
