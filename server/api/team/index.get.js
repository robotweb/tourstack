import { knex } from '~/server/db/knex';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const userUuid = query.user;
    if (!userUuid) {
      setResponseStatus(event, 400);
      return { error: 'User UUID is required' };
    }
    // Look up the local user row by authid (UUID)
    const localUser = await knex('user').where({ authid: userUuid }).first();
    if (!localUser) {
      setResponseStatus(event, 404);
      return { error: 'User not found in local database' };
    }
    // Fetch teams for the user
    let teams = await knex('team')
      .select('team.*')
      .join('team_user as tu', 'team.id', 'tu.team_id')
      .where('tu.user_id', localUser.id);

    if (!teams || teams.length === 0) {
      // Create a new team
      const newTeam = {
        uid: crypto.randomUUID(),
        name: ''
      };
      await knex('team').insert(newTeam);
      // Get the inserted team
      const record = await knex('team').where('uid', newTeam.uid).first();
      // Link the user to the new team
      await knex('team_user').insert({
        user_id: localUser.id,
        team_id: record.id
      });
      // Return the new team
      return [record];
    }
    return teams;
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to fetch teams', details: error.message };
  }
}); 