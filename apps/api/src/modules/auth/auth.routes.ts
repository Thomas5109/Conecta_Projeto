import { FastifyInstance } from 'fastify';
import { loginController } from './auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
    app.post(
        '/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['senha'],
                    additionalProperties: false,
                    properties: {
                        email: { type: 'string', minLength: 3, maxLength: 255 },
                        cpf: { type: 'string', minLength: 11, maxLength: 14 },
                        senha: { type: 'string', minLength: 1, maxLength: 128 },
                    },
                    oneOf: [
                        { required: ['email'], not: { required: ['cpf'] } },
                        { required: ['cpf'], not: { required: ['email'] } },
                    ],
                },
            },
        },
        loginController,
    );
}
