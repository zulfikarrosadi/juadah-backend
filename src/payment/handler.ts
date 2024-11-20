import type { Request, Response } from 'express'
import type ApiResponse from '../schema'
import type { OrderWebhookPayload, PaymentRequest } from './schema'

type OrderTokenResponse = {
  token: string
  redirect_url: string
}

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

interface PaymentService {
  requestOrderToken(
    data: PaymentRequest,
  ): Promise<ApiResponse<OrderTokenResponse>>
  orderWebhookReceiver(data: OrderWebhookPayload): Promise<ApiResponse<any>>
  checkOrderStatus(orderId: string): Promise<ApiResponse<OrderStatus>>
}

class PaymentHandler {
  constructor(private service: PaymentService) {}

  requestOrderToken = async (
    req: Request<Record<string, any>, Record<string, any>, PaymentRequest>,
    res: Response<ApiResponse<OrderTokenResponse>>,
  ) => {
    const result = await this.service.requestOrderToken(req.body)
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.status(201).json(result)
  }

  orderWebhook = async (
    req: Request<Record<string, any>, Record<string, any>, OrderWebhookPayload>,
    res: Response,
  ) => {
    const result = await this.service.orderWebhookReceiver(req.body)
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.sendStatus(200)
  }

  checkOrderStatus = async (
    req: Request<{ orderId: string }>,
    res: Response,
  ) => {
    const { orderId: id } = req.params
    const result = await this.service.checkOrderStatus(id)
    if (result.status === 'fail') {
      return res.status(result.errors.code).json(result)
    }
    return res.status(200).json(result)
  }
}

export default PaymentHandler
