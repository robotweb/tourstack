import { knex } from '~/server/db/knex';

export default defineEventHandler(async (event) => {
  try {
    const serviceTypeData = await readBody(event);
    if (!serviceTypeData) {
      setResponseStatus(event, 400);
      return { error: 'Service type data is required' };
    }
    const teamUid = serviceTypeData.teamUid

    const team = await knex('team')
      .where('uid',teamUid)
      .first()

    const user = await this.$authFetch('/api/auth/me');
    console.log(user)
    const teamId = team.id
    serviceTypeData.team_id = teamId;
    serviceTypeData.created_by = 
    delete serviceTypeData.teamUid;
    const [newServiceType] = await knex('service-type')
      .insert(serviceTypeData)
      .returning('*');
    setResponseStatus(event, 201);
    return newServiceType;
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to create service type', details: error.message };
  }
}); 