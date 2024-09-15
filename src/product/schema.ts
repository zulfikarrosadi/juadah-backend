import { z } from 'zod'

export const createProduct = z.object({
  name: z
    .string({ message: 'product name is required' })
    .min(1, 'product name is required'),
  description: z
    .string({ message: 'product description is required' })
    .min(1, 'product description is required'),
  price: z.string().transform((val) => {
    const valInNumber = Number.parseFloat(val)
    if (Number.isNaN(valInNumber)) {
      throw new Error('product price is invalid')
    }
    return valInNumber
  }),
  images: z.string().array().optional(),
})

export type CreateProduct = z.TypeOf<typeof createProduct>
export type Product = z.TypeOf<typeof createProduct> & { id: number }
