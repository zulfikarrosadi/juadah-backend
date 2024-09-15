export type CurrentUser = { user: { userId: number; username: string } }

type ApiResponse<Data> =
  | { status: 'success'; data: Record<string, Data> }
  | {
      status: 'fail'
      errors: {
        code: number
        message: string
        details?: Record<string, string>
      }
    }

export default ApiResponse
