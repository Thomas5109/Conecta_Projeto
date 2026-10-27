
import { FastifyInstance } from 'fastify';
import { cadastrarClienteController } from './controller.js';

export async function clientRoutes(app: FastifyInstance) {
    app.post(
        '/clientes',
        cadastrarClienteController
    );
}
