import { randomUUID } from 'node:crypto'
import { type Logger, getContext } from '../lib/logger'
import type ApiResponse from '../schema'
import type { ApiResponseV2 } from '../schema'
import type { PaymentRequest, SaveOrder, TransactionStatus } from './schema'
import 'dotenv/config'
import { BadRequestError } from '../lib/Error'

type OrderStatus = {
  order_id: string
  transaction_id: string
  transaction_status: string
  product_id: bigint
  product_name: string
  total_price: string
  completed_at: bigint | null
  created_at: bigint
}

interface PaymentRepository {
  createOrder(data: PaymentRequest): Promise<{
    id: string
    product: {
      id: bigint
      name: string
    }
    user: {
      id: bigint
      email: string
      fullname: string
    }
    address: { full_address: string }
    amount: number
    created_at: number
    total_price: string
  }>
  updateOrderStatus(data: SaveOrder): Promise<{
    user: {
      fullname: string
      email: string
    }
    address: {
      full_address: string
    }
    product: {
      name: string
    }
    total_price: string
    transaction_status: TransactionStatus['transaction_status'] | null
  }>
  getOrderStatus(orderId: string): Promise<{
    id: string
    transaction_id: string
    transaction_status: string
    product: {
      id: bigint
      name: string
    }
    total_price: string
    created_at: bigint
    completed_at: bigint | null
  }>
}

class PaymentService {
  constructor(
    private repository: PaymentRepository,
    private logger: Logger,
  ) {}
  private MIDTRANS_BASE_URL = process.env.MIDTRANS_BASE_URL as string
  private MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY as string

  async requestOrderToken(
    data: PaymentRequest,
  ): Promise<ApiResponse<{ token: string; redirect_url: string }>> {
    try {
      const order_id = randomUUID()

      const response = await fetch(this.MIDTRANS_BASE_URL, {
        body: JSON.stringify({
          transaction_details: {
            order_id: order_id,
            gross_amount: data.transaction_details.gross_amount,
          },
          customer_details: {
            email: data.customer_details.email,
            fullname: data.customer_details.fullname,
          },
        }),
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(this.MIDTRANS_SERVER_KEY)}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      })
      const result = await response.json()
      if (response.status !== 201) {
        const context = getContext()
        this.logger(
          'error',
          `fail to proccessd order request: midtrans error ${result.error_messages}`,
          'service',
          'requestOrderToken',
          context,
        )
        throw new BadRequestError(
          'fail to proceed order request, please try again',
        )
      }
      await this.repository.createOrder({ ...data, order_id })
      return {
        status: 'success',
        data: {
          midtrans: {
            token: result.token,
            redirect_url: result.redirect_url,
          },
        },
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'service',
        'payment_sendRequest',
        context,
      )
      return {
        status: 'fail',
        errors: {
          code: 400,
          message: 'fail to procceed order request, please try again later',
        },
      }
    }
  }

  async orderWebhookReceiver(data: SaveOrder): Promise<ApiResponse<any>> {
    try {
      await this.repository.updateOrderStatus({
        order_id: data.order_id,
        transaction_status: data.transaction_status,
        total_price: data.total_price,
        amount: data.amount,
        transaction_id: data.transaction_id,
        payment_type: data.payment_type,
        completed_at: data.completed_at || undefined,
        address_id: data.address_id,
        user_id: data.user_id,
        product_id: data.product_id,
        product_price: data.product_price,
      })
      return {
        status: 'success',
        data: {},
      }
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        error.message || error,
        'service',
        'orderWebhookReceiver',
        context,
      )
      return {
        status: 'fail',
        errors: {
          code: error.code,
          message: error.message,
        },
      }
    }
  }
  async checkOrderStatus(orderId: string): Promise<ApiResponseV2<OrderStatus>> {
    try {
      const result = await this.repository.getOrderStatus(orderId)
      return {
        status: 'success',
        data: {
          order_id: result.id,
          transaction_id: result.transaction_id,
          transaction_status: result.transaction_status,
          product_id: result.product.id,
          total_price: result.total_price,
          product_name: result.product.name,
          completed_at: result.completed_at,
          created_at: result.created_at,
        },
      }
    } catch (error: any) {
      return {
        status: 'fail',
        errors: {
          code: error.code,
          message: error.message || error,
        },
      }
    }
  }
}

export default PaymentService
