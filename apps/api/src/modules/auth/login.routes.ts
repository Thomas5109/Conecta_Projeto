import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';

import { pool } from '../../infrastructure/database/pool.js';

// Formato dos dados recebidos pela API.
interface LoginBody {
    email: string;
    senha: string;
}

// Formato dos dados que o PostgreSQL retorna.
interface UsuarioEncontrado {
    id_usuario: number;
    email: string;
    senha: string;
    status_da_conta: string;
    tipo_usuario: string;
    id_cliente: number | null;
    nome: string | null;
}

export async function loginRoutes(app: FastifyInstance) {
    app.post<{ Body: LoginBody }>(
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
        async (request, reply) => {
            const email = request.body.email
                .trim()
                .toLowerCase();

            const senha = request.body.senha;

            // O bcrypt suporta até 72 bytes de senha.
            // Impedimos que uma senha maior seja truncada.
            if (bcrypt.truncates(senha)) {
                return reply.code(400).send({
                    erro: 'A senha excede o tamanho suportado.',
                });
            }

            // Procuramos a conta pelo e-mail.
            const resultado = await pool.query<UsuarioEncontrado>(
                `
                SELECT
                    u.id_usuario,
                    u.email,
                    u.senha,
                    u.status_da_conta,
                    u.tipo_usuario,
                    c.id_cliente,
                    c.nome
                FROM usuario AS u
                LEFT JOIN usuario_cliente AS c
                    ON c.id_usuario = u.id_usuario
                WHERE LOWER(u.email) = $1
                LIMIT 1
                `,
                [email]
            );

            const usuario = resultado.rows[0];

            // Não revelamos se o e-mail existe ou não.
            if (
                !usuario ||
                !(await bcrypt.compare(senha, usuario.senha))
            ) {
                return reply.code(401).send({
                    erro: 'E-mail ou senha inválidos.',
                });
            }

            // Impedimos o uso de contas inativas.
            if (usuario.status_da_conta !== 'ATIVO') {
                return reply.code(403).send({
                    erro: 'Esta conta não está ativa.',
                });
            }

            // Não retornamos a senha nem seu hash.
            return reply.code(200).send({
                mensagem:
                    'Credenciais válidas. A sessão ainda não foi implementada.',

                usuario: {
                    idUsuario: usuario.id_usuario,
                    email: usuario.email,
                    tipoUsuario: usuario.tipo_usuario,

                    cliente:
                        usuario.id_cliente === null
                            ? null
                            : {
                                  idCliente: usuario.id_cliente,
                                  nome: usuario.nome,
                              },
                },
            });
        }
    );
}