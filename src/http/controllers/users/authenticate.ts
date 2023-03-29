import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeAuthenticateUseCase } from '@/use-cases/factories/make-authenticate-use-case'

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

    const token = await createJWT({ reply, sub: user.id })

    return reply.status(200).send({
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
  sub: string
}
async function createJWT({ reply, sub }: ICreateJWTParams) {
  return await reply.jwtSign(
    {},
    {
      sign: { sub },
    },
  )
}
