import { prisma } from '@/lib/prisma'
import { Gym, Prisma } from '@prisma/client'
import { GymsRepository, IFindManyNearbyParams } from '../gyms-repository'

export class PrismaGymsRepository implements GymsRepository {
  async findById(id: string): Promise<Gym | null> {
    return await prisma.gym.findUnique({ where: { id } })
  }

  async findManyNearby({
    latitude,
    longitude,
  }: IFindManyNearbyParams): Promise<Gym[]> {
    return await prisma.$queryRaw<Gym[]>`
      SELECT * from gyms
      WHERE ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) * sin( radians( latitude ) ) ) ) <= 10
    `
  }

  async searchMany(query: string, page: number): Promise<Gym[]> {
    return await prisma.gym.findMany({
      where: {
        title: {
          contains: query,
        },
      },
      take: 20,
      skip: (page - 1) * 20,
    })
  }

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    return await prisma.gym.create({ data })
  }
}
