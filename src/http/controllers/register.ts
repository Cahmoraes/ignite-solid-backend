import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UserAlreadyExists } from '@/use-cases/errors/user-already-exists-error'
import { makeRegisterUseCase } from '@/use-cases/factories/make-register-use-case'

const registerBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const { name, password, email } = registerBodySchema.parse(request.body)

  try {
    const registerUserCase = makeRegisterUseCase()

    await registerUserCase.execute({
      name,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof UserAlreadyExists) {
      return reply.code(409).send({ message: error.message })
    }

    throw error
  }
  return reply.status(201).send()
}
