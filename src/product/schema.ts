import { z } from 'zod'

export const createProduct = z.object({
  name: z
    .string({ message: 'product name is required' })
    .min(1, 'product name is required'),
  description: z
    .string({ message: 'product description is required' })
    .min(1, 'product description is required'),
  price: z
    .number({ message: 'product price is required' })
    .nonnegative('product price is invalid')
    .gte(1000, 'product price should be minimum Rp. 1000'),
  image: z.string().optional(),
})

export type CreateProduct = z.TypeOf<typeof createProduct>
export type Product = z.TypeOf<typeof createProduct> & { id: number }
