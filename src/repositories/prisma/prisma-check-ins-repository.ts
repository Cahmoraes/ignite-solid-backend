import { prisma } from '@/lib/prisma'
import { CheckIn, Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { CheckInsRepository } from '../check-ins-repository'

export class PrismaCheckInsRepository implements CheckInsRepository {
  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    return await prisma.checkIn.create({
      data,
    })
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const startOfTheDay = dayjs(date).startOf('date')
    const endOfTheDay = dayjs(date).endOf('date')

    return await prisma.checkIn.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: startOfTheDay.toDate(),
          lte: endOfTheDay.toDate(),
        },
      },
    })
  }

  async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    return await prisma.checkIn.findMany({
      where: { user_id: userId },
      take: 20,
      skip: (page - 1) * 20,
    })
  }

  async findById(id: string): Promise<CheckIn | null> {
    return await prisma.checkIn.findUnique({
      where: {
        id,
      },
    })
  }

  async countByUserId(userId: string): Promise<number> {
    return await prisma.checkIn.count({
      where: {
        user_id: userId,
      },
    })
  }

  async save(checkIn: CheckIn): Promise<CheckIn> {
    return await prisma.checkIn.update({
      where: { id: checkIn.id },
      data: checkIn,
    })
  }
}
