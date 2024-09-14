export type CurrentUser = { user: { userId: number; username: string } }

export type SuccessResponse = Record<string, unknown>

export type FailResponse = {
  code: number
  message: string
  details?: Record<string, string>
}

type ApiResponse<Success, Fail> =
  | { status: 'success'; data: Success }
  | { status: 'fail'; errors: Fail }
export default ApiResponse
