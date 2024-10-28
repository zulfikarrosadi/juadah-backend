import { type JwtPayload, sign, verify } from 'jsonwebtoken'
import 'dotenv/config'

/**
 * 10 minutes in ms
 */
export const accessTokenMaxAge = 600000
/**
 * 10 days in ms
 */
export const refreshTokenMaxAge = 864000000
const tokenSecret = process.env.TOKEN_SECRET as string
type decodedType = JwtPayload & {
  fullname: string
  email: string
}

export function verifyToken(token: string): {
  decodedData: decodedType | null
} {
  try {
    const decoded = verify(token, tokenSecret, {
      algorithms: ['HS256'],
    }) as decodedType

    return { decodedData: decoded }
  } catch (error: any) {
    return { decodedData: null }
  }
}

export function createNewToken(data: {
  fullname: string
  email: string
  expiration: number
}) {
  const token = sign(
    {
      tokenId: Math.random(),
      fullname: data.fullname,
      email: data.email,
    },
    tokenSecret,
    {
      algorithm: 'HS256',
      expiresIn: data.expiration,
    },
  )
  return token
}
