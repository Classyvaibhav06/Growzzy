import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.JWT_SECRET || 'secret'
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  try {
    return await decrypt(session)
  } catch (error) {
    return null
  }
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  if (!session) return

  const parsed = await decrypt(session)
  parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  const res = await encrypt(parsed)
  
  ;(await cookies()).set({
    name: 'session',
    value: res,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: parsed.expires,
    sameSite: 'lax',
    path: '/',
  })
}

export async function clearSession() {
  ;(await cookies()).delete('session')
}
