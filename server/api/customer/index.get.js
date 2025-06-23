import { knex } from '~/server/db/knex';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const teamUid = query.team;
    if (!teamUid) {
      setResponseStatus(event, 400);
      return { error: 'Team UID is required' };
    }
    const customers = await knex('customer')
      .join('team', 'customer.team_id', 'team.id')
      .where('team.uid', teamUid)
      .select('customer.*');
    return customers;
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to fetch customers', details: error.message };
  }
}); 