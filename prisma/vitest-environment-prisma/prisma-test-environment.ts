import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { exec } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { Environment } from 'vitest'

// postgresql://docker:docker@localhost:5432/apisolid?schema=public
const prisma = new PrismaClient()

export default <Environment>{
  name: 'prisma',
  async setup() {
    const schema = randomUUID()
    const databaseURL = generateDatabaseURL(schema)
    process.env.DATABASE_URL = databaseURL
    exec('npx prisma migrate deploy')

    return {
      async teardown() {
        await prisma.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        )
        await prisma.$disconnect()
      },
    }
  },
}

function generateDatabaseURL(schema: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide DATABASE_URL environment variable')
  }
  const url = new URL(process.env.DATABASE_URL)
  url.searchParams.set('schema', schema)
  return url.toString()
}
