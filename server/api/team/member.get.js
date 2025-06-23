import { knex } from '~/server/db/knex';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const teamUid = query.team;
    if (!teamUid) {
      setResponseStatus(event, 400);
      return { error: 'Team UID is required' };
    }
    const members = await knex('team_user')
      .join('team', 'team_user.team_id', 'team.id')
      .join('user', 'team_user.user_id', 'user.id')
      .where('team.uid', teamUid)
      .select('user.id', 'user.name');
    return members;
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to fetch team members', details: error.message };
  }
}); 