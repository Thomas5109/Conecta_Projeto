import { pool } from '../../infrastructure/database/pool.js';
import { ClientRow } from "./client.types.js";

interface CriarClienteParams {
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
        cpf,
        email,
        senhaHash,
        nome,
        telefone,
        data_de_nascimento,
        sexo,
    } = params;

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
            [cpf, email, 'ATIVO', 'CLIENTE', senhaHash]
        );
        const idUsuario = usuarioResult.rows[0].id_usuario;
        const clienteResult = await client.query<ClientRow>(
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
            [idUsuario, nome, telefone, data_de_nascimento, sexo]
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