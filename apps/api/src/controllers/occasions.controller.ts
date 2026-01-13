import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { OccasionRepository } from '../repositories/occasion.repo.js';
import { OccasionType, OccasionRecurrence, OccasionVisibility } from '@prisma/client';

const createOccasionSchema = z.object({
  recipientId: z.string().optional(),
  type: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'HOUSEWARMING', 'WEDDING', 'BABY_SHOWER', 'THANK_YOU', 'JUST_BECAUSE', 'OTHER']),
  title: z.string().optional(),
  date: z.string().datetime(),
  timezone: z.string().optional(),
  isAllDay: z.boolean().optional(),
  recurrence: z.enum(['NONE', 'YEARLY']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
  sharedWithUserIds: z.array(z.string()).optional(),
  reminderPolicyId: z.string().optional(),
});

const updateOccasionSchema = createOccasionSchema.partial();

export async function createOccasion(request: FastifyRequest, reply: FastifyReply) {
  const data = createOccasionSchema.parse(request.body);
  const occasionRepo = new OccasionRepository();

  const occasion = await occasionRepo.create({
    ownerUserId: request.userId,
    recipientId: data.recipientId,
    type: data.type as OccasionType,
    title: data.title,
    date: new Date(data.date),
    timezone: data.timezone,
    isAllDay: data.isAllDay,
    recurrence: data.recurrence as OccasionRecurrence | undefined,
    visibility: data.visibility as OccasionVisibility | undefined,
    sharedWithUserIds: data.sharedWithUserIds,
    reminderPolicyId: data.reminderPolicyId,
  });

  return reply.status(201).send(occasion);
}

export async function getOccasions(request: FastifyRequest, reply: FastifyReply) {
  const { recipientId } = request.query as { recipientId?: string };
  const occasionRepo = new OccasionRepository();

  const occasions = await occasionRepo.findByOwner(request.userId, recipientId);
  return reply.send(occasions);
}

export async function getUpcomingOccasions(request: FastifyRequest, reply: FastifyReply) {
  const { days } = request.query as { days?: string };
  const occasionRepo = new OccasionRepository();

  const occasions = await occasionRepo.findUpcoming(
    request.userId,
    days ? parseInt(days) : 30
  );

  return reply.send(occasions);
}

export async function getOccasionFeed(request: FastifyRequest, reply: FastifyReply) {
  const { days } = request.query as { days?: string };
  const occasionRepo = new OccasionRepository();

  const occasions = await occasionRepo.findFeed(
    request.userId,
    days ? parseInt(days) : 30
  );

  // Grouping logic: next two weeks, and later
  const now = new Date();
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(now.getDate() + 14);

  const nextTwoWeeks = occasions.filter((o: any) => o.date <= twoWeeksLater);
  const later = occasions.filter((o: any) => o.date > twoWeeksLater);

  return reply.send({
    nextTwoWeeks,
    later,
  });
}

export async function updateOccasion(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const data = updateOccasionSchema.parse(request.body);
  const occasionRepo = new OccasionRepository();

  const occasion = await occasionRepo.findById(id);
  if (!occasion || (occasion.ownerUserId !== request.userId)) {
    return reply.status(404).send({
      error: {
        code: 'OCCASION_NOT_FOUND',
        message: 'Occasion not found',
      },
    });
  }

  const updated = await occasionRepo.update(id, {
    ...data,
    type: data.type as OccasionType | undefined,
    date: data.date ? new Date(data.date) : undefined,
    recurrence: data.recurrence as OccasionRecurrence | undefined,
    visibility: data.visibility as OccasionVisibility | undefined,
    sharedWithUserIds: data.sharedWithUserIds,
  });

  return reply.send(updated);
}

export async function deleteOccasion(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const occasionRepo = new OccasionRepository();

  const occasion = await occasionRepo.findById(id);
  if (!occasion || occasion.ownerUserId !== request.userId) {
    return reply.status(404).send({
      error: {
        code: 'OCCASION_NOT_FOUND',
        message: 'Occasion not found',
      },
    });
  }

  await occasionRepo.delete(id);
  return reply.status(204).send();
}
