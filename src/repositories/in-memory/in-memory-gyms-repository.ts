import { getDistanceBetweenCoordinates } from '@/utils/get-distace-between-coordinates'
import { Gym, Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'
import { GymsRepository, IFindManyNearbyParams } from '../gyms-repository'

export class InMemoryGymsRepository implements GymsRepository {
  public items: Gym[] = []

  async findManyNearby(params: IFindManyNearbyParams) {
    return this.items.filter(
      this.filterDistanceBy10Kilometers.bind(this, params),
    )
  }

  async searchMany(query: string, page: number): Promise<Gym[]> {
    return this.items
      .filter((item) => item.title.includes(query))
      .slice((page - 1) * 20, page * 20)
  }

  async create(data: Prisma.GymCreateInput): Promise<Gym> {
    const gym = {
      id: data.id ?? randomUUID(),
      title: data.title,
      phone: data.phone ?? null,
      description: data.description ?? null,
      latitude: new Prisma.Decimal(data.latitude.toString()),
      longitude: new Prisma.Decimal(data.longitude.toString()),
      created_at: new Date(),
    }

    this.items.push(gym)
    return gym
  }

  async findById(id: string): Promise<Gym | null> {
    const gym = this.items.find((gym) => gym.id === id)
    if (!gym) return null
    return gym
  }

  private filterDistanceBy10Kilometers(
    gymParams: IFindManyNearbyParams,
    gym: Gym,
  ) {
    const distance = getDistanceBetweenCoordinates(
      {
        latitude: gymParams.latitude,
        longitude: gymParams.longitude,
      },
      {
        latitude: gym.latitude.toNumber(),
        longitude: gym.longitude.toNumber(),
      },
    )
    console.log(distance)
    return distance < 10
  }
}
