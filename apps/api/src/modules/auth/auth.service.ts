import bcrypt from 'bcryptjs';
import { buscarUsuarioPorCpf, buscarUsuarioPorEmail } from './auth.repository.js';
import type { UsuarioRow } from './auth.types.js';

export class AuthServiceError extends Error {
    constructor(public message: string, public statusCode: number = 400) {
        super(message);
        this.name = 'AuthServiceError';
    }
}

export interface UsuarioAutenticado {
    idUsuario: string;
    email: string;
    tipoUsuario: string;
    cliente: { idCliente: string; nome: string | null } | null;
}

type IdentificadorLogin = { email: string } | { cpf: string };

export async function autenticarUsuario(
    identificador: IdentificadorLogin,
    senha: string,
): Promise<UsuarioAutenticado> {
    if (bcrypt.truncates(senha)) {
        throw new AuthServiceError('A senha excede o tamanho suportado.', 400);
    }

    let usuario: UsuarioRow | null;
    if ('cpf' in identificador) {
        const cpf = identificador.cpf.replace(/\D/g, '');
        if (!/^\d{11}$/.test(cpf)) {
            throw new AuthServiceError('CPF ou senha inválidos.', 401);
        }
        usuario = await buscarUsuarioPorCpf(cpf);
    } else {
        usuario = await buscarUsuarioPorEmail(identificador.email.trim().toLowerCase());
    }

    if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
        throw new AuthServiceError('CPF/e-mail ou senha inválidos.', 401);
    }
    if (usuario.status_da_conta !== 'ATIVO') {
        throw new AuthServiceError('Esta conta não está ativa.', 403);
    }

    return {
        idUsuario: usuario.id_usuario,
        email: usuario.email,
        tipoUsuario: usuario.tipo_usuario,
        cliente: usuario.id_cliente === null
            ? null
            : { idCliente: usuario.id_cliente, nome: usuario.nome },
    };
}
