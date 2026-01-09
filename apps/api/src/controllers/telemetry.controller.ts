import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TelemetryRepository } from '../repositories/telemetry.repo';

const startSessionSchema = z.object({
  sessionId: z.string(),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  buildNumber: z.string().optional(),
});

const eventsSchema = z.object({
  events: z.array(z.object({
    name: z.string(),
    props: z.any().optional(),
    ts: z.string().datetime().optional(),
  })),
  sessionId: z.string().optional(),
  deviceId: z.string().optional(),
});

export async function startSession(request: FastifyRequest, reply: FastifyReply) {
  const data = startSessionSchema.parse(request.body);
  const telemetryRepo = new TelemetryRepository();

  await telemetryRepo.createEvents([{
    userId: request.userId,
    sessionId: data.sessionId,
    deviceId: data.deviceId,
    name: 'session.start',
    props: {
      appVersion: data.appVersion,
      buildNumber: data.buildNumber,
    },
  }]);

  return reply.send({ success: true });
}

export async function batchEvents(request: FastifyRequest, reply: FastifyReply) {
  const data = eventsSchema.parse(request.body);
  const telemetryRepo = new TelemetryRepository();

  const events = data.events.map(event => ({
    userId: request.userId,
    sessionId: data.sessionId,
    deviceId: data.deviceId,
    name: event.name,
    props: event.props,
    ts: event.ts ? new Date(event.ts) : new Date(),
  }));

  await telemetryRepo.createEvents(events);

  return reply.send({ success: true, count: events.length });
}
