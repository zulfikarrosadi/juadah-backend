import { z } from 'zod'

export const createUserSchema = z
  .object({
    fullname: z.string().min(1, 'fullname should have minimum 1 characters'),
    email: z
      .string()
      .min(1, 'email is required')
      .email('your email is in invalid format'),
    password: z.string().min(1, 'password is required'),
    passwordConfirmation: z
      .string({ required_error: 'password confirmation is required' })
      .min(1, 'password confirmation is required'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'password and password confirmation is not match',
    path: ['password'],
  })

export type User = Omit<
  z.TypeOf<typeof createUserSchema>,
  'passwordConfirmation'
>
