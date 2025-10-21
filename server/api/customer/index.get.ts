import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const teamUid = query.team;
    if (!teamUid || typeof teamUid !== 'string') {
      setResponseStatus(event, 400);
      return { error: 'Team UID is required' };
    }
    const customers = await prisma.customer.findMany({
      where: {
        team: {
          id: parseInt(teamUid)
        }
      }
    });
    return customers;
  } catch (error: any) {
    setResponseStatus(event, 500);
    return { error: 'Failed to fetch customers', details: error.message };
  }
}); 