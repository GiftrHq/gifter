import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { RecipientRepository } from '../repositories/recipient.repo';
import { RecipientType } from '@prisma/client';

const createRecipientSchema = z.object({
  type: z.enum(['USER', 'EXTERNAL']),
  userId: z.string().optional(),
  name: z.string().optional(),
  relationship: z.string().optional(),
  birthday: z.string().datetime().optional(),
  notes: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

const updateRecipientSchema = z.object({
  name: z.string().optional(),
  relationship: z.string().optional(),
  birthday: z.string().datetime().optional(),
  notes: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export async function createRecipient(request: FastifyRequest, reply: FastifyReply) {
  const data = createRecipientSchema.parse(request.body);
  const recipientRepo = new RecipientRepository();

  const recipient = await recipientRepo.create({
    ownerUserId: request.userId,
    type: data.type as RecipientType,
    userId: data.userId,
    name: data.name,
    relationship: data.relationship,
    birthday: data.birthday ? new Date(data.birthday) : undefined,
    notes: data.notes,
    avatarUrl: data.avatarUrl,
  });

  return reply.status(201).send(recipient);
}

export async function getRecipients(request: FastifyRequest, reply: FastifyReply) {
  const recipientRepo = new RecipientRepository();
  const recipients = await recipientRepo.findByOwner(request.userId);
  return reply.send(recipients);
}

export async function getRecipient(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const recipientRepo = new RecipientRepository();

  const recipient = await recipientRepo.findById(id);

  if (!recipient || recipient.ownerUserId !== request.userId) {
    return reply.status(404).send({
      error: {
        code: 'RECIPIENT_NOT_FOUND',
        message: 'Recipient not found',
      },
    });
  }

  return reply.send(recipient);
}

export async function updateRecipient(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const data = updateRecipientSchema.parse(request.body);
  const recipientRepo = new RecipientRepository();

  const recipient = await recipientRepo.findById(id);
  if (!recipient || recipient.ownerUserId !== request.userId) {
    return reply.status(404).send({
      error: {
        code: 'RECIPIENT_NOT_FOUND',
        message: 'Recipient not found',
      },
    });
  }

  const updated = await recipientRepo.update(id, {
    ...data,
    birthday: data.birthday ? new Date(data.birthday) : undefined,
  });

  return reply.send(updated);
}

export async function deleteRecipient(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const recipientRepo = new RecipientRepository();

  const recipient = await recipientRepo.findById(id);
  if (!recipient || recipient.ownerUserId !== request.userId) {
    return reply.status(404).send({
      error: {
        code: 'RECIPIENT_NOT_FOUND',
        message: 'Recipient not found',
      },
    });
  }

  await recipientRepo.delete(id);
  return reply.status(204).send();
}
