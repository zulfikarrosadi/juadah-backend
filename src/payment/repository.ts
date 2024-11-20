import type { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { BadRequestError, NotFoundError } from '../lib/Error'
import { type Logger, getContext } from '../lib/logger'
import type { SaveOrder } from './schema'
import type { PaymentRequest } from './schema'

class PaymentRepository {
  constructor(
    private prisma: PrismaClient,
    private logger: Logger,
  ) {}
  private RELATED_RECORD_NOT_EXIST = 'P2025'
  /**
   * this could happen because race condition in upsert operation
   */
  private CONSTRAINT_ERROR = 'P2002'

  async createOrder(data: PaymentRequest) {
    try {
      const result = await this.prisma.orders.create({
        data: {
          id: data.order_id,
          product: {
            connect: {
              id: data.transaction_details.product_id,
            },
          },
          user: {
            connect: {
              email: data.customer_details.email,
            },
          },
          address: {
            connect: {
              id: data.customer_details.address_id,
            },
          },
          total_price: `${data.transaction_details.gross_amount}`,
          created_at: new Date().getTime(),
          amount: data.transaction_details.product_count_total,
        },
        select: {
          id: true,
          product: { select: { id: true, name: true } },
          user: { select: { id: true, email: true, fullname: true } },
          address: { select: { full_address: true } },
          created_at: true,
          amount: true,
          total_price: true,
        },
      })

      return result
    } catch (error: any) {
      const context = getContext()
      this.logger(
        'error',
        `fail to create order: ${error.message || error}`,
        'repository',
        'createOrder',
        context,
      )
      throw new BadRequestError('fail to create order, please try again later')
    }
  }

  async updateOrderStatus(data: SaveOrder) {
    try {
      if (
        data.transaction_status === 'settlement' ||
        data.transaction_status === 'capture'
      ) {
        const result = await this.prisma.orders.update({
          where: {
            id: data.order_id,
          },
          data: {
            transaction_id: data.transaction_id,
            completed_at: new Date().getTime(),
            transaction_status: data.transaction_status,
            payment_type: data.payment_type,
          },
        })
        return result
      }

      const result = await this.prisma.orders.update({
        where: {
          id: data.order_id,
        },
        data: {
          transaction_id: data.transaction_id,
          transaction_status: data.transaction_status,
          payment_type: data.payment_type,
        },
      })
      return result
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            `foreign key fail: ${error.message}`,
            'repository',
            'createOrUpdateOrder',
            context,
          )
        }
        if (error.code === this.CONSTRAINT_ERROR) {
          this.logger(
            'error',
            `race condition happen: ${error.message}`,
            'repository',
            'createOrUpdateOrder',
            context,
          )
        }
      }
      this.logger(
        'error',
        error.message || error,
        'repository',
        'createOrUpdateOrder',
        context,
      )
      throw new BadRequestError(
        'fail to place an order, please try again later',
      )
    }
  }

  async getOrderStatus(orderId: string) {
    try {
      const result = await this.prisma.orders.findUniqueOrThrow({
        where: {
          id: orderId,
        },
        select: {
          id: true,
          transaction_id: true,
          transaction_status: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          total_price: true,
          completed_at: true,
          created_at: true,
        },
      })
      return result
    } catch (error: any) {
      const context = getContext()
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === this.RELATED_RECORD_NOT_EXIST) {
          this.logger(
            'error',
            `get order status failed, order id not found ${error.message}`,
            'repository',
            'getOrderStatus',
            context,
          )
          throw new NotFoundError('get order status failed, order is not found')
        }
        this.logger(
          'error',
          `get order status failed, bad request: ${error.message || error}`,
          'repository',
          'getOrderStatus',
          context,
        )
        throw new BadRequestError(
          'get order status failed, please try again later and make sure to provide valid information',
        )
      }
    }
  }
}

export default PaymentRepository
