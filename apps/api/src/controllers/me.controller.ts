import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UserRepository } from '../repositories/user.repo.js';

const updateMeSchema = z.object({
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  timezone: z.string().optional(),
  defaultCurrency: z.string().optional(),
  phone: z.string().optional(),
});

const addDeviceSchema = z.object({
  platform: z.string(),
  token: z.string(),
  appVersion: z.string().optional(),
  buildNumber: z.string().optional(),
});

export async function getMe(request: FastifyRequest, reply: FastifyReply) {
  const userRepo = new UserRepository();
  const user = await userRepo.findById(request.userId);

  if (!user) {
    return reply.status(404).send({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    });
  }

  // Transform tasteProfiles array to single tasteProfile for compatibility
  const { tasteProfiles, ...userData } = user as any;

  // Map updatedAt to completedAt if facets exist (indicates completed onboarding)
  let tasteProfile = null;
  if (tasteProfiles && tasteProfiles.length > 0) {
    const profile = tasteProfiles[0];
    tasteProfile = {
      ...profile,
      userId: profile.ownerUserId, // Map ownerUserId to userId for compatibility
      completedAt: profile.facets ? profile.updatedAt : null, // Only mark as complete if facets exist
    };
  }

  const response = {
    ...userData,
    tasteProfile,
  };

  return reply.send(response);
}

export async function updateMe(request: FastifyRequest, reply: FastifyReply) {
  const data = updateMeSchema.parse(request.body);
  const userRepo = new UserRepository();

  const user = await userRepo.update(request.userId, data);
  return reply.send(user);
}

export async function addDevice(request: FastifyRequest, reply: FastifyReply) {
  const data = addDeviceSchema.parse(request.body);
  const userRepo = new UserRepository();

  const device = await userRepo.addDevice(request.userId, data);
  return reply.send(device);
}

export async function removeDevice(request: FastifyRequest, reply: FastifyReply) {
  const { deviceId } = request.params as { deviceId: string };
  const userRepo = new UserRepository();

  await userRepo.removeDevice(deviceId);
  return reply.status(204).send();
}
