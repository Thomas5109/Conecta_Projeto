import type { FastifyReply, FastifyRequest } from 'fastify';
import { autenticarUsuario, AuthServiceError } from './auth.service.js';
import type { LoginBody } from './auth.types.js';

export async function loginController(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
) {
    try {
        const usuario = await autenticarUsuario(
            request.body.email,
            request.body.senha
        );

        return reply.code(200).send({
            mensagem:
                'Credenciais válidas. A sessão ainda não foi implementada.',
            usuario,
        });
    } catch (error) {
        // Captura e responde erros de domínio validados no Service
        if (error instanceof AuthServiceError) {
            return reply
                .code(error.statusCode)
                .send({ erro: error.message });
        }

        // Erros não esperados/falhas de servidor
        console.error('Erro interno na autenticação:', error);
        return reply
            .code(500)
            .send({ erro: 'Ocorreu um erro interno no servidor.' });
    }
}
