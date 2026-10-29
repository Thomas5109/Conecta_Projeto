import { FastifyInstance } from 'fastify';
import { createClientController } from './client.controller.js';

export async function clientRoutes(app: FastifyInstance) {
    app.post(
        '/clientes',
        {
            schema: {
                body: {
                    type: 'object',
                    required: [
                        'cpf',
                        'email',
                        'senha',
                        'nome',
                        'telefone',
                        'data_de_nascimento',
                        'sexo',
                    ],

                    additionalProperties: false,

                    properties: {
                        cpf: { type: 'string' },
                        email: { type: 'string' },
                        senha: { type: 'string' },
                        nome: { type: 'string' },
                        telefone: { type: 'string' },
                        data_de_nascimento: { type: 'string' },
                        sexo: { type: 'string' },
                    }
                }
            }
        }, 
        createClientController
    );
}