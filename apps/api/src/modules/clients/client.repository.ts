import { randomUUID } from 'node:crypto';
import { pool } from '../../infrastructure/database/pool.js';
import { ClientRow } from "./client.types.js";

interface CriarClienteParams {
    id_usuario?: string;
    id_cliente?: string;
    cpf: string;
    email: string;
    senhaHash: string;
    nome: string;
    telefone: string;
    data_de_nascimento: string;
    sexo: string;
}

export async function criarCliente(
    params: CriarClienteParams
): Promise<ClientRow> {

    const {
        id_usuario,
        id_cliente,
        cpf,
        email,
        senhaHash,
        nome,
        telefone,
        data_de_nascimento,
        sexo,
    } = params;

    const idUsuario = id_usuario || randomUUID();
    const idCliente = id_cliente || randomUUID();

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const usuarioResult = await client.query(
            `
            INSERT INTO usuario (
                id_usuario,
                cpf,
                email,
                status_da_conta,
                tipo_usuario,
                senha
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_usuario
            `,
            [idUsuario, cpf, email, 'ATIVO', 'CLIENTE', senhaHash]
        );
        const usuarioCriadoId = usuarioResult.rows[0].id_usuario;
        const clienteResult = await client.query<ClientRow>(
            `
            INSERT INTO usuario_cliente (
                id_cliente,
                id_usuario,
                nome,
                telefone,
                data_de_nascimento,
                sexo
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id_cliente,
                id_usuario,
                nome,
                telefone,
                data_de_nascimento,
                sexo
            `,
            [idCliente, usuarioCriadoId, nome, telefone, data_de_nascimento, sexo]
        );
        await client.query('COMMIT');

        return clienteResult.rows[0];

    } catch (error) {
        await client.query(`ROLLBACK`);
        throw error;
    } finally {
        client.release();
    }
}
