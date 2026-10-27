
import bcrypt from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { isValidCpf } from '@brazilian-utils/brazilian-utils';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

import { pool } from '../../infrastructure/database/pool.js';

// Verifica se a data existe no calendário e não está no futuro.
function dataNascimentoValida(data: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split('-').map(Number);

    const dataInformada = new Date(
        Date.UTC(ano, mes - 1, dia)
    );

    if (
        dataInformada.getUTCFullYear() !== ano ||
        dataInformada.getUTCMonth() !== mes - 1 ||
        dataInformada.getUTCDate() !== dia
    ) {
        return false;
    }

    const hoje = new Date();
    const hojeUTC = Date.UTC(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate()
    );

    return dataInformada.getTime() <= hojeUTC;
}

// Regras de validação dos dados recebidos.
const cadastroClienteSchema = z.object({
    cpf: z
        .string()
        .trim()
        .refine(
            (cpf) => isValidCpf(cpf),
            'Informe um CPF válido.'
        )
        .transform((cpf) => cpf.replace(/\D/g, '')),

    email: z
        .string()
        .trim()
        .email('Informe um e-mail válido.')
        .transform((email) => email.toLowerCase()),

    senha: z
        .string()
        .min(8, 'A senha deve ter pelo menos 8 caracteres.')
        .max(72, 'A senha não pode ultrapassar 72 caracteres.'),

    nome: z
        .string()
        .trim()
        .min(2, 'Informe um nome válido.')
        .max(150, 'O nome deve ter no máximo 150 caracteres.'),

    telefone: z
        .string()
        .trim()
        .refine(
            (telefone) => {
                const numero = parsePhoneNumberFromString(
                    telefone,
                    'BR'
                );

                return numero?.isValid() ?? false;
            },
            'Informe um telefone brasileiro válido.'
        )
        .transform((telefone) => {
            return parsePhoneNumberFromString(
                telefone,
                'BR'
            )!.number;
        }),

    data_de_nascimento: z
        .string()
        .refine(
            dataNascimentoValida,
            'Informe uma data válida, no formato AAAA-MM-DD, que não esteja no futuro.'
        ),

    sexo: z
        .string()
        .trim()
        .min(1, 'O campo sexo é obrigatório.')
        .max(30, 'O campo sexo deve ter no máximo 30 caracteres.'),
});

export async function cadastrarClienteController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    // 1. Validar os dados recebidos.
    const resultado = cadastroClienteSchema.safeParse(
        request.body
    );

    if (!resultado.success) {
        return reply.code(400).send({
            erro: 'Dados inválidos.',
            detalhes: resultado.error.flatten().fieldErrors,
        });
    }

    // Os dados abaixo já passaram pela validação.
    // CPF, e-mail e telefone também foram normalizados.
    const {
        cpf,
        email,
        senha,
        nome,
        telefone,
        data_de_nascimento,
        sexo,
    } = resultado.data;

    // 2. Gerar o hash da senha.
    const senhaHash = await bcrypt.hash(senha, 10);

    // 3. Abrir conexão com o banco.
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 4. Cadastrar o usuário.
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

        const idUsuario = usuarioResult.rows[0].id_usuario;

        // 5. Cadastrar os dados específicos do cliente.
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

        // 6. Confirmar a transação.
        await client.query('COMMIT');

        return reply.code(201).send({
            mensagem: 'Cliente cadastrado com sucesso.',
            cliente: clienteResult.rows[0],
        });

    } catch (error) {
        await client.query('ROLLBACK');

        const databaseError = error as {
            code?: string;
            constraint?: string;
        };

        // CPF ou e-mail duplicado.
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
