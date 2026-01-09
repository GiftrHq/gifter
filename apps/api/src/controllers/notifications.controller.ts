import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { NotificationRepository } from '../repositories/notification.repo';

const updatePreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  quietHours: z.any().optional(),
  defaultReminderPolicyId: z.string().optional(),
});

export async function getNotifications(request: FastifyRequest, reply: FastifyReply) {
  const { status } = request.query as { status?: string };
  const notificationRepo = new NotificationRepository();

  const notifications = await notificationRepo.findByUser(
    request.userId,
    status === 'unread'
  );

  return reply.send(notifications);
}

export async function markAsRead(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const notificationRepo = new NotificationRepository();

  await notificationRepo.markAsRead(id);
  return reply.status(204).send();
}

export async function getPreferences(request: FastifyRequest, reply: FastifyReply) {
  const notificationRepo = new NotificationRepository();
  const prefs = await notificationRepo.getPreferences(request.userId);

  if (!prefs) {
    // Return defaults
    return reply.send({
      pushEnabled: true,
      emailEnabled: false,
    });
  }

  return reply.send(prefs);
}

export async function updatePreferences(request: FastifyRequest, reply: FastifyReply) {
  const data = updatePreferencesSchema.parse(request.body);
  const notificationRepo = new NotificationRepository();

  const prefs = await notificationRepo.upsertPreferences(request.userId, data);
  return reply.send(prefs);
}
