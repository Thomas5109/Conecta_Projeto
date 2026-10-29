import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { createClient } from "./client.service.js";
import type { CreateClientBody } from "./client.types.js";

// Lê os dados da requisição, delega ao service e monta a resposta HTTP.
export async function createClientController(
    request: FastifyRequest <{ Body: CreateClientBody }>,
    reply: FastifyReply
) {
    try {
        const cliente = await createClient(request.body);

        return reply.code(201).send({
            mensagem: 'Cliente Cadastrado com sucesso!.',
            cliente,
        });

    } catch (error) {
        const databaseError = error as { code?: string };

        if (databaseError.code === '23505') {
            return reply.code(409).send({
                erro: 'CPF ou e-mail já cadastrado.',
            });
        }

        throw error;
    }
}
