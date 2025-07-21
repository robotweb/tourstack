import { knex } from '~/server/db/knex';

export default defineEventHandler(async (event) => {
  try {
    const customerData = await readBody(event);
    if (!customerData) {
      setResponseStatus(event, 400);
      return { error: 'Customer data is required' };
    }
    const teamUid = customerData.teamUid

    const team = await knex('team')
      .where('uid',teamUid)
      .first()

      console.log(team)

    const teamId = team.id
    customerData.team_id = teamId;
    delete customerData.teamUid;
    const [newCustomer] = await knex('customer')
      .insert(customerData)
      .returning('*');
    setResponseStatus(event, 201);
    return newCustomer;
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to create customer', details: error.message };
  }
}); 