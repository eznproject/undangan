import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  console.log('Admin user created:', admin)

  // Create a sample event
  const event = await prisma.event.upsert({
    where: { id: 'default-event' },
    update: {},
    create: {
      id: 'default-event',
      title: 'Acara Spesial',
      date: '2025-01-20',
      time: '19:00',
      location: 'Grand Ballroom Hotel',
      description: 'Acara perayaan spesial yang akan dihadiri oleh tamu undangan.',
    },
  })

  console.log('Sample event created:', event)

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
