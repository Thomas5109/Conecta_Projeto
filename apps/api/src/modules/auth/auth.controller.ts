import type { FastifyReply, FastifyRequest } from 'fastify';
import { autenticarUsuario, AuthServiceError } from './auth.service.js';
import type { LoginBody } from './auth.types.js';

export async function loginController(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply,
) {
    try {
        const identificador = typeof request.body.cpf === 'string'
            ? { cpf: request.body.cpf }
            : { email: request.body.email };

        const usuario = await autenticarUsuario(identificador, request.body.senha);

        if (!usuario.cliente) {
            return reply.code(403).send({
                erro: 'Este usuário não possui um perfil de cliente vinculado.',
            });
        }

        const token = await reply.jwtSign(
            { id_cliente: usuario.cliente.idCliente },
            { expiresIn: '7d' },
        );

        return reply.code(200).send({
            token,
            usuario: {
                idUsuario: usuario.idUsuario,
                idCliente: usuario.cliente.idCliente,
                nome: usuario.cliente.nome,
                email: usuario.email,
            },
        });
    } catch (error) {
        if (error instanceof AuthServiceError) {
            return reply.code(error.statusCode).send({ erro: error.message });
        }
        console.error('Erro interno na autenticação:', error);
        return reply.code(500).send({ erro: 'Ocorreu um erro interno no servidor.' });
    }
}