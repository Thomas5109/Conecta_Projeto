import type { FastifyReply, FastifyRequest } from 'fastify';
import { createClient, ClientServiceError } from './client.service.js';
import type { CreateClientBody } from './client.types.js';

export async function createClientController(
    request: FastifyRequest<{ Body: CreateClientBody }>,
    reply: FastifyReply
) {
    try {
        // Toda a validação e processamento agora acontece internamente no Service
        const cliente = await createClient(request.body);

        // Resposta de sucesso (201 Created)
        return reply.code(201).send({
            mensagem: 'Cliente Cadastrado com sucesso!.',
            cliente,
        });
    } catch (error) {
        // Captura e responde erros de domínio validados no Service
        if (error instanceof ClientServiceError) {
            return reply.code(error.statusCode).send({ erro: error.message });
        }

        // Erros não esperados/falhas de servidor
        console.error('Erro interno na criação do cliente:', error);
        return reply.code(500).send({ erro: 'Ocorreu um erro interno no servidor.' });
    }
}