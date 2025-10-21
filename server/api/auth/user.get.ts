import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~/server/db/prisma'

export default defineEventHandler(async (event) => {
  const params = getQuery(event)
  const userId = typeof params.userid === 'string' ? params.userid : ''
  
  if (!userId) {
    return { error: 'User ID is required' }
  }

  try {
    const isNumericId = /^\d+$/.test(userId)
    const user = await prisma.user.findUnique({
      where: isNumericId ? { id: parseInt(userId, 10) } : { authid: userId }
    })
    
    if (!user) {
      return { error: 'User not found' }
    }
    return user
  } catch (error: any) {
    console.error('❌ Database error in user.get:', error)
    return { error: 'Database error' }
  }
})