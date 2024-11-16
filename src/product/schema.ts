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

export const updateProduct = z.object({
  name: z.string({ required_error: 'name is required' }),
  description: z.string({ required_error: 'description is required' }),
  price: z.string({ required_error: 'price is required' }).transform((val) => {
    const valInNumber = Number.parseFloat(val)
    if (Number.isNaN(valInNumber)) {
      throw new Error('product price is invalid')
    }
    return valInNumber
  }),
  images: z.object({
    removed: z.array(z.string(), { required_error: 'this field is required' }),
  }),
})

export type CreateProduct = z.TypeOf<typeof createProduct>
export type Product = z.TypeOf<typeof createProduct> & { id: bigint }
export type UpdateProduct = z.TypeOf<typeof updateProduct>
export type UpdateProductDataService = {
  name: string
  description: string
  price: number
  images: {
    removed: string[]
    new: string[]
  }
}
export type FlattenUpdateProduct = Omit<UpdateProduct, 'images'> & {
  images: string[]
}
