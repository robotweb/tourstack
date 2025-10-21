import { prisma } from '~/server/db/prisma';
import authStack from '~/server/service/authStack';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userUuid = query.user;
    if (!userUuid) {
      setResponseStatus(event, 400);
      return { error: 'User UUID is required' };
    }
    
    // Look up the local user row by authid (UUID)
    let localUser = await prisma.user.findUnique({ where: { authid: userUuid } });
    
    // If user doesn't exist, validate with auth service and create user
    if (!localUser) {
      try {
        // Get user data from auth service using the user UUID
        const authUser = await authStack.get(`/auth/user/${userUuid}`);
        
        if (!authUser || !authUser.user_id) {
          setResponseStatus(event, 404);
          return { error: 'User not found in auth service' };
        }
        
        // Create user with real data from auth service
        localUser = await prisma.user.create({
          data: {
            authid: authUser.user_id,
            email: authUser.email || `user-${userUuid}@example.com`,
            firstname: authUser.name || 'New User',
            lastname: authUser.lastname || null
          }
        });
      } catch (authError: any) {
        setResponseStatus(event, 401);
        return { error: 'Failed to validate user with auth service', details: authError.message };
      }
    }
    // Fetch teams for the user
    let teams = await prisma.team.findMany({
      where: {
        teamUsers: {
          some: {
            userId: localUser.id
          }
        }
      }
    });

    if (!teams || teams.length === 0) {
      // Create a new team
      const newTeam = await prisma.team.create({
        data: {
          name: ''
        }
      });
      // Link the user to the new team
      await prisma.teamUser.create({
        data: {
          userId: localUser.id,
          teamId: newTeam.id
        }
      });
      // Return the new team
      return [newTeam];
    }
    return teams;
  } catch (error: any) {
    setResponseStatus(event, 500);
    return { error: 'Failed to fetch teams', details: error.message };
  }
}); 