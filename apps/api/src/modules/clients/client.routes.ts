import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { pool } from '../../infrastructure/database/pool.js';

interface CreateClientBody {
    cpf: string;
    email: string;
    senha: string;
    nome: string;
    telefone: string;
    data_de_nascimento: string;
    sexo: string;
}

export async function clientRoutes(app: FastifyInstance) {
    app.post<{ Body: CreateClientBody }>(
        '/clientes',
        async (request, reply) => {
            const {
                cpf,
                email,
                senha,
                nome,
                telefone,
                data_de_nascimento,
                sexo,
            } = request.body;

            if (
                !cpf ||
                !email ||
                !senha ||
                !nome ||
                !telefone ||
                !data_de_nascimento ||
                !sexo
            ) {
                return reply.code(400).send({
                    erro: 'Todos os campos são obrigatórios.',
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                const usuarioResult = await client.query(
                    `
                    INSERT INTO usuario (
                        cpf,
                        email,
                        status_da_conta,
                        tipo_usuario,
                        senha
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id_usuario
                    `,
                    [
                        cpf,
                        email,
                        'ATIVO',
                        'CLIENTE',
                        senhaHash,
                    ]
                );

                const idUsuario =
                    usuarioResult.rows[0].id_usuario;

                const clienteResult = await client.query(
                    `
                    INSERT INTO usuario_cliente (
                        id_usuario,
                        nome,
                        telefone,
                        data_de_nascimento,
                        sexo
                    )
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING
                        id_cliente,
                        id_usuario,
                        nome,
                        telefone,
                        data_de_nascimento,
                        sexo
                    `,
                    [
                        idUsuario,
                        nome,
                        telefone,
                        data_de_nascimento,
                        sexo,
                    ]
                );

                await client.query('COMMIT');

                return reply.code(201).send({
                    mensagem: 'Cliente cadastrado com sucesso.',
                    cliente: clienteResult.rows[0],
                });

            } catch (error) {

                await client.query('ROLLBACK');

                const databaseError = error as {
                    code?: string;
                };

                if (databaseError.code === '23505') {
                    return reply.code(409).send({
                        erro: 'CPF ou e-mail já cadastrado.',
                    });
                }

                throw error;

            } finally {
                client.release();
            }
        }
    );
}