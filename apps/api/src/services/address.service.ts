import { AddressRepository } from '../repositories/address.repo.js';
import { Address } from '@prisma/client';

export class AddressService {
    private addressRepo: AddressRepository;

    constructor() {
        this.addressRepo = new AddressRepository();
    }

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
        if (data.isDefault) {
            await this.addressRepo.clearDefaults(data.userId);
        } else {
            // If this is the first address, make it default automatically
            const existing = await this.addressRepo.listByUserId(data.userId);
            if (existing.length === 0) {
                data.isDefault = true;
            }
        }

        return this.addressRepo.create(data);
    }

    async update(id: string, userId: string, data: Partial<Address>) {
        // If setting to default, clear others
        if (data.isDefault === true) {
            await this.addressRepo.clearDefaults(userId);
        }

        return this.addressRepo.update(id, data);
    }

    async delete(id: string) {
        return this.addressRepo.delete(id);
    }

    async list(userId: string) {
        return this.addressRepo.listByUserId(userId);
    }

    async get(id: string) {
        return this.addressRepo.findById(id);
    }
}
