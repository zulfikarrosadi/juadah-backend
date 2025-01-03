import { ZodError, z } from 'zod'

export const createProduct = z.object({
  name: z
    .string({ message: 'product name is required' })
    .min(1, 'product name is required'),
  description: z
    .string({ message: 'product description is required' })
    .min(1, 'product description is required'),
  price: z.string(),
  images: z.string().array().optional(),
})

export const updateProduct = z.object({
  name: z.string({ required_error: 'name is required' }),
  description: z.string({ required_error: 'description is required' }),
  price: z.string({ required_error: 'price is required' }),
  images: z.object({
    removed: z.array(z.string(), { required_error: 'this field is required' }),
  }),
})

export type CreateProduct = Omit<z.TypeOf<typeof createProduct>, 'price'> & {
  price: number
}
export type Product = Omit<z.TypeOf<typeof createProduct>, 'price'> & {
  id: bigint
  price: number
}
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
export type FlattenUpdateProduct = Omit<UpdateProduct, 'images' | 'price'> & {
  images: string[]
  price: number
}
