import bcrypt from 'bcryptjs';
import { buscarUsuarioPorEmail } from './auth.repository.js';
import type { UsuarioRow } from './auth.types.js';

// Classe auxiliar para padronizar os erros gerados pelas regras de negócio.
export class AuthServiceError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'AuthServiceError';
    }
}

// Dados seguros do usuário (sem a senha/hash).
export interface UsuarioAutenticado {
    idUsuario: string;
    email: string;
    tipoUsuario: string;
    cliente: {
        idCliente: string;
        nome: string | null;
    } | null;
}

/**
 * Autentica um usuário com e-mail e senha.
 *
 * Regras de negócio:
 *   1. A senha não pode exceder o limite do bcrypt (72 bytes).
 *   2. E-mail e senha devem corresponder a um usuário existente.
 *   3. A conta deve estar ativa.
 *
 * Retorna os dados seguros do usuário (sem hash de senha).
 */
export async function autenticarUsuario(
    email: string,
    senha: string
): Promise<UsuarioAutenticado> {
    // O bcrypt suporta até 72 bytes de senha.
    // Impedimos que uma senha maior seja truncada.
    if (bcrypt.truncates(senha)) {
        throw new AuthServiceError(
            'A senha excede o tamanho suportado.',
            400
        );
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Procuramos a conta pelo e-mail.
    const usuario: UsuarioRow | null =
        await buscarUsuarioPorEmail(emailNormalizado);

    // Não revelamos se o e-mail existe ou não.
    if (
        !usuario ||
        !(await bcrypt.compare(senha, usuario.senha))
    ) {
        throw new AuthServiceError(
            'E-mail ou senha inválidos.',
            401
        );
    }

    // Impedimos o uso de contas inativas.
    if (usuario.status_da_conta !== 'ATIVO') {
        throw new AuthServiceError(
            'Esta conta não está ativa.',
            403
        );
    }

    // Retornamos os dados seguros (sem hash de senha).
    return {
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
    };
}
