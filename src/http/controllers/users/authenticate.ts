import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'
import { User } from '@prisma/client'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { password, email } = authenticateBodySchema.parse(request.body)

  try {
    const authenticateUseCase = makeAuthenticateUseCase()

    const { user } = await authenticateUseCase.execute({
      email,
      password,
    })

    const token = await createJWT({ reply, user })
    const refreshToken = await createRefreshToken({ reply, user })

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
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.code(400).send({ message: error.message })
    }

    throw error
  }
}

interface ICreateJWTParams {
  reply: FastifyReply
  user: User
}
async function createJWT({ reply, user }: ICreateJWTParams) {
  return await reply.jwtSign(
    {
      role: user.role,
    },
    {
      sign: { sub: user.id },
    },
  )
}

async function createRefreshToken({ reply, user }: ICreateJWTParams) {
  return await reply.jwtSign(
    {
      role: user.role,
    },
    {
      sign: { sub: user.id, expiresIn: '7d' },
    },
  )
}
