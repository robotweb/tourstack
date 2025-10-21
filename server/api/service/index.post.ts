import { prisma } from '~/server/db/prisma';

export default defineEventHandler(async (event) => {
  try {
    const serviceData = await readBody(event);
    if (!serviceData) {
      setResponseStatus(event, 400);
      return { error: 'Service data is required' };
    }
    const teamUid = serviceData.teamUid;

    const team = await prisma.team.findFirst({
      where: { id: parseInt(teamUid) }
    });

    console.log(team);
    const teamId = team.id;
    serviceData.teamId = teamId;
    delete serviceData.teamUid;
    const newService = await prisma.service.create({
      data: serviceData
    });
    setResponseStatus(event, 201);
    return newService;
  } catch (error: any) {
    setResponseStatus(event, 500);
    return { error: 'Failed to create service', details: error.message };
  }
});
