import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'email is required' })
    .email('your email format is invalid')
    .min(1, 'email is required'),
  password: z
    .string({ required_error: 'password is required' })
    .min(1, 'password is required'),
})

export const registerUser = z
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

export type RegisterUser = Omit<
  z.TypeOf<typeof registerUser>,
  'passwordConfirmation'
>
export type Login = z.TypeOf<typeof loginSchema>
