import { FastifyRequest, FastifyReply } from 'fastify'

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify({ onlyCookie: true })

  const token = await createJWT({ reply, user: request.user })
  const refreshToken = await createRefreshToken({
    reply,
    user: request.user,
  })

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({
      token,
    })
}

interface ICreateJWTParams {
  reply: FastifyReply
  user: { sub: string; role: 'ADMIN' | 'MEMBER' }
}
async function createJWT({ reply, user }: ICreateJWTParams) {
  return await reply.jwtSign(
    {
      role: user.role,
    },
    {
      sign: { sub: user.sub },
    },
  )
}

async function createRefreshToken({ reply, user }: ICreateJWTParams) {
  return await reply.jwtSign(
    {
      role: user.role,
    },
    {
      sign: { sub: user.sub, expiresIn: '7d' },
    },
  )
}
