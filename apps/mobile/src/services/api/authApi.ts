import type { LoginResponse } from '../../types/auth.types';
import { postJson } from './apiClient';

export function fazerLogin(email: string, senha: string) {
    return postJson<LoginResponse>('/login', { email, senha });
}
