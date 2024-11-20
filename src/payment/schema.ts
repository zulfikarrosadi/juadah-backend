import { Transaction_Status } from '@prisma/client'
import { z } from 'zod'

const paymentRequestSchema = z.object({
  transaction_details: z.object({
    product_id: z.number({ required_error: 'product id is required' }),
    gross_amount: z.number({ required_error: 'amount is required' }),
    product_count_total: z.number({
      required_error: 'product amount is required',
    }),
  }),
  customer_details: z.object({
    email: z
      .string({ required_error: 'email is required' })
      .trim()
      .email('input valid email format'),
    fullname: z
      .string({ required_error: 'fullname is required' })
      .trim()
      .min(1, 'fullname is required'),
    address_id: z.number({ required_error: 'address is required' }),
  }),
})

const orderWebhookSchema = z.object({
  transaction_time: z.string().datetime(),
  status_code: z.string(),
  transaction_status: z.enum([
    'capture',
    'settlement',
    'pending',
    'deny',
    'cancel',
    'expire',
    'failure',
    'refund',
    'partial_refund',
    'authorize',
  ]),
  signature_key: z.string(),
  gross_amount: z.string(),
  order_id: z.string(),
  transaction_id: z.string(),
  payment_type: z.string(),
  fraud_status: z.enum(['accept', 'deny']),
})

export const saveOrderSchema = z.object({
  order_id: z.string({ required_error: 'order id is required' }),
  transaction_id: z.string({ required_error: 'transaction id is required' }),
  user_id: z.bigint({ required_error: 'user id is required' }),
  product_id: z.bigint({ required_error: 'product id is required' }),
  product_price: z.number({
    message: 'individual product price',
    required_error: 'product price is required',
  }),
  amount: z.number({
    message: 'how many product user brought',
    required_error: 'product amount is required',
  }),
  transaction_status: z.enum([
    'capture',
    'settlement',
    'pending',
    'deny',
    'cancel',
    'expire',
    'failure',
    'refund',
    'partial_refund',
    'authorize',
  ]),
  address_id: z.number({ required_error: 'address is required' }),
  payment_type: z.string({ required_error: 'payment type is required' }),
  total_price: z
    .number({ required_error: 'total price is required' })
    .transform((value) => value.toString()),
  completed_at: z.number().optional(),
})

export type SaveOrder = z.infer<typeof saveOrderSchema>
export type PaymentRequest = z.infer<typeof paymentRequestSchema> & {
  order_id: string
}

export type OrderWebhookPayload = z.infer<typeof orderWebhookSchema>
export type TransactionStatus = Pick<OrderWebhookPayload, 'transaction_status'>
