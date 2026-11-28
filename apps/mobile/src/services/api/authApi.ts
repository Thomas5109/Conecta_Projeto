import type { LoginResponse } from '../../types/auth.types';
import {
    removerToken,
    removerUsuario,
    salvarToken,
    salvarUsuario,
} from '../storage/localData';
import { syncData } from '../sync';
import { postJson } from './apiClient';

export async function fazerLogin(
    identificador: string,
    senha: string,
): Promise<LoginResponse> {
    const valor = identificador.trim();
    const credenciais = valor.includes('@')
        ? { email: valor.toLowerCase(), senha }
        : { cpf: valor.replace(/\D/g, ''), senha };

    const resposta = await postJson<LoginResponse>('/login', credenciais);

    await Promise.all([
        salvarToken(resposta.token),
        salvarUsuario(resposta.usuario),
    ]);

    void syncData().catch((err) => console.log('Sync pendente (login):', err));

    return resposta;
}