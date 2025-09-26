import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const serviceTypeData = await readBody(event);
    if (!serviceTypeData) {
      setResponseStatus(event, 400);
      return { error: 'Service type data is required' };
    }
    const teamUid = serviceTypeData.teamUid

    const team = await prisma.team.findFirst({
      where: { id: parseInt(teamUid) }
    });

    console.log(team);
    const teamId = team.id;
    serviceTypeData.teamId = teamId;
    delete serviceTypeData.teamUid;
    const newServiceType = await prisma.serviceType.create({
      data: serviceTypeData
    });
    setResponseStatus(event, 201);
    return newServiceType;
  } catch (error) {
    setResponseStatus(event, 500);
    return { error: 'Failed to create service type', details: error.message };
  }
}); 