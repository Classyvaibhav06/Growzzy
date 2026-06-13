import { PrismaClient, NotificationType } from '@prisma/client'

const prisma = new PrismaClient()

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  metadata?: any
}) {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
    }
  })
}

export async function markNotificationAsRead(id: string) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  })
}
