import type { UsuarioLocal } from './localData.types';

export interface LoginResponse {
    token: string;
    usuario: UsuarioLocal;
}