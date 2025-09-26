import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
    try {
      const query = getQuery(event);
      const teamUid = query.team;
      if (!teamUid) {
        setResponseStatus(event, 400);
        return { error: 'Team UID is required' };
      }
      const serviceTypes = await prisma.serviceType.findMany({
        where: {
          team: {
            id: parseInt(teamUid)
          }
        }
      });
      return serviceTypes;
    } catch (error) {
      setResponseStatus(event, 500);
      return { error: 'Failed to fetch customers', details: error.message };
    }
  }); 