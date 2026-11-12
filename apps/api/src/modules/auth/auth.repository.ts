import { pool } from '../../infrastructure/database/pool.js';
import type { UsuarioRow } from './auth.types.js';

async function buscarUsuarioPorCampo(
    campo: 'email' | 'cpf',
    valor: string,
): Promise<UsuarioRow | null> {
    const condicao = campo === 'email' ? 'LOWER(u.email)' : 'u.cpf';
    const consulta = [
        'SELECT u.id_usuario, u.email, u.senha, u.status_da_conta,',
        '       u.tipo_usuario, c.id_cliente, c.nome',
        'FROM usuario AS u',
        'LEFT JOIN usuario_cliente AS c ON c.id_usuario = u.id_usuario',
        'WHERE ' + condicao + ' = $1',
        'LIMIT 1',
    ].join('\n');
    const resultado = await pool.query<UsuarioRow>(consulta, [valor]);
    return resultado.rows[0] ?? null;
}

export function buscarUsuarioPorEmail(email: string): Promise<UsuarioRow | null> {
    return buscarUsuarioPorCampo('email', email);
}

export function buscarUsuarioPorCpf(cpf: string): Promise<UsuarioRow | null> {
    return buscarUsuarioPorCampo('cpf', cpf);
}
