import { FastifyInstance } from 'fastify';
import { loginController } from './auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
    app.post(
        '/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'senha'],
                    additionalProperties: false,

                    properties: {
                        email: {
                            type: 'string',
                            minLength: 3,
                            maxLength: 255,
                        },

                        senha: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 128,
                        },
                    },
                },
            },
        },
        loginController
    );
}
