import { prisma } from '../services/prisma.js';
import { Address } from '@prisma/client';

export class AddressRepository {
    async create(data: {
        userId: string;
        label?: string;
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postalCode: string;
        country: string;
        phoneNumber?: string;
        isDefault?: boolean;
    }) {
        return prisma.address.create({
            data,
        });
    }

    async update(id: string, data: Partial<Address>) {
        return prisma.address.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return prisma.address.delete({
            where: { id },
        });
    }

    async findById(id: string) {
        return prisma.address.findUnique({
            where: { id },
        });
    }

    async listByUserId(userId: string) {
        return prisma.address.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findDefaultByUserId(userId: string) {
        return prisma.address.findFirst({
            where: { userId, isDefault: true },
        });
    }

    async clearDefaults(userId: string) {
        return prisma.address.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }
}
