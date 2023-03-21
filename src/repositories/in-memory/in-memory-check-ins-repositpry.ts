import dayjs from 'dayjs'
import { asserts } from '@/utils/asserts'
import { CheckIn, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'
import { CheckInsRepository } from '../check-ins-repository'

export class InMemoryCheckInsRepository implements CheckInsRepository {
  public items: CheckIn[] = []

  async save(checkIn: CheckIn): Promise<CheckIn> {
    const checkInIndex = this.items.findIndex((item) => item.id === checkIn.id)

    if (checkInIndex >= 0) {
      this.items[checkInIndex] = checkIn
    }

    return checkIn
  }

  async findById(id: string): Promise<CheckIn | null> {
    const checkIn = this.items.find((item) => item.id === id)

    if (!checkIn) {
      return null
    }

    return checkIn
  }

  async countByUserId(userId: string): Promise<number> {
    return this.items.filter((item) => item.user_id === userId).length
  }

  async findManyByUserId(userId: string, page: number): Promise<CheckIn[]> {
    return this.items
      .filter((item) => item.user_id === userId)
      .slice((page - 1) * 20, page * 20)
  }

  async create(data: Prisma.CheckInUncheckedCreateInput): Promise<CheckIn> {
    const checkIn: CheckIn = {
      id: randomUUID(),
      user_id: data.user_id,
      gym_id: data.gym_id,
      validated_at: data.validated_at ? new Date() : null,
      created_at: new Date(),
    }

    this.items.push(checkIn)
    return checkIn
  }

  async findByUserIdOnDate(
    userId: string,
    date: Date,
  ): Promise<CheckIn | null> {
    const datesRange = new DateRange()
    datesRange.startOfTheDay = date
    datesRange.endOfTheDay = date

    const checkInOnSameDate = this.items.find((checkIn) => {
      datesRange.checkInDate = checkIn.created_at
      const isOnSameDate = this.isEligibleDate(datesRange)
      return checkIn.user_id === userId && isOnSameDate
    })

    if (!checkInOnSameDate) {
      return null
    }

    return checkInOnSameDate
  }

  private isEligibleDate(dates: DateRange): boolean {
    return (
      dates.checkInDate!.isAfter(dates.startOfTheDay) &&
      dates.checkInDate!.isBefore(dates.endOfTheDay)
    )
  }
}

class DateRange {
  private _startOfTheDay?: dayjs.Dayjs
  private _checkInDate?: dayjs.Dayjs
  private _endOfTheDay?: dayjs.Dayjs

  get startOfTheDay(): dayjs.Dayjs | undefined {
    return this._startOfTheDay
  }

  set startOfTheDay(date: unknown) {
    asserts(date instanceof Date, 'startOfTheDay must be a Date')
    this._startOfTheDay = dayjs(date).startOf('date')
  }

  get checkInDate(): dayjs.Dayjs | undefined {
    return this._checkInDate
  }

  set checkInDate(date: unknown) {
    asserts(date instanceof Date, 'checkInDate must be a Date')
    this._checkInDate = dayjs(date)
  }

  get endOfTheDay(): dayjs.Dayjs | undefined {
    return this._endOfTheDay
  }

  set endOfTheDay(date: unknown) {
    asserts(date instanceof Date, 'endOfTheDay must be a Date')
    this._endOfTheDay = dayjs(date).endOf('day')
  }
}
