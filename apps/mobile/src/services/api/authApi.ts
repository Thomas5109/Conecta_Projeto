import type { LoginResponse } from '../../types/auth.types';
import { postJson } from './apiClient';

export function fazerLogin(identificador: string, senha: string) {
    const valor = identificador.trim();
    const credenciais = valor.includes('@')
        ? { email: valor.toLowerCase(), senha }
        : { cpf: valor.replace(/\D/g, ''), senha };
    return postJson<LoginResponse>('/login', credenciais);
}
