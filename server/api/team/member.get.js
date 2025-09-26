import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const teamUid = query.team;
    if (!teamUid) {
      setResponseStatus(event, 400);
      return { error: 'Team UID is required' };
    }
    const members = await prisma.teamUser.findMany({
      where: {
        team: {
          id: parseInt(teamUid)
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstname: true,
            lastname: true
          }
        }
      }
    });
    return members.map(member => ({
      id: member.user.id,
      name: member.user.firstname + (member.user.lastname ? ' ' + member.user.lastname : '')
    }));
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to fetch team members', details: error.message };
  }
}); 