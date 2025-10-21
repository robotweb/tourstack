import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const customerData = await readBody(event);
    if (!customerData) {
      setResponseStatus(event, 400);
      return { error: 'Customer data is required' };
    }
    const teamUid = customerData.teamUid

    const team = await prisma.team.findFirst({
      where: { id: parseInt(teamUid) }
    });

    console.log(team);

    const teamId = team.id;
    customerData.teamId = teamId;
    delete customerData.teamUid;
    const newCustomer = await prisma.customer.create({
      data: customerData
    });
    setResponseStatus(event, 201);
    return newCustomer;
  } catch (error: any) {
    setResponseStatus(event, 500);
    return { error: 'Failed to create customer', details: error.message };
  }
}); 