import { FastifyInstance } from 'fastify';
import { createAddress, getAddresses, getAddress, updateAddress, deleteAddress } from '../controllers/addresses.controller.js';

export async function addressesRoutes(app: FastifyInstance) {
    app.post('/addresses', createAddress);
    app.get('/addresses', getAddresses);
    app.get('/addresses/:id', getAddress);
    app.patch('/addresses/:id', updateAddress);
    app.delete('/addresses/:id', deleteAddress);
}
