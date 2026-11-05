import { pool } from '../../infrastructure/database/pool.js';
import type { UsuarioRow } from './auth.types.js';

/**
 * Busca um usuário pelo e-mail (já normalizado em lowercase).
 * Retorna os dados do usuário + dados do cliente (se existir), ou null.
 */
export async function buscarUsuarioPorEmail(
    email: string
): Promise<UsuarioRow | null> {
    const resultado = await pool.query<UsuarioRow>(
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

    return resultado.rows[0] ?? null;
}
