import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AddressService } from '../services/address.service.js';

const createAddressSchema = z.object({
    label: z.string().optional(),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
    phoneNumber: z.string().optional(),
    isDefault: z.boolean().optional(),
});

const updateAddressSchema = z.object({
    label: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    phoneNumber: z.string().optional(),
    isDefault: z.boolean().optional(),
});

export async function createAddress(request: FastifyRequest, reply: FastifyReply) {
    const data = createAddressSchema.parse(request.body);
    const service = new AddressService();

    const address = await service.create({
        userId: request.userId,
        ...data,
    });

    return reply.status(201).send(address);
}

export async function getAddresses(request: FastifyRequest, reply: FastifyReply) {
    const service = new AddressService();
    const addresses = await service.list(request.userId);
    return reply.send(addresses);
}

export async function getAddress(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const service = new AddressService();
    const address = await service.get(id);

    if (!address || address.userId !== request.userId) {
        return reply.status(404).send({
            error: {
                code: 'ADDRESS_NOT_FOUND',
                message: 'Address not found',
            },
        });
    }

    return reply.send(address);
}

export async function updateAddress(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateAddressSchema.parse(request.body);
    const service = new AddressService();

    const address = await service.get(id);

    if (!address || address.userId !== request.userId) {
        return reply.status(404).send({
            error: {
                code: 'ADDRESS_NOT_FOUND',
                message: 'Address not found',
            },
        });
    }

    const updated = await service.update(id, request.userId, data);
    return reply.send(updated);
}

export async function deleteAddress(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const service = new AddressService();

    const address = await service.get(id);

    if (!address || address.userId !== request.userId) {
        return reply.status(404).send({
            error: {
                code: 'ADDRESS_NOT_FOUND',
                message: 'Address not found',
            },
        });
    }

    await service.delete(id);
    return reply.status(204).send();
}
