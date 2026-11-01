import type {
    CreateClientData,
    CreateClientResponse,
} from '../../types/client.types';
import { postJson } from './apiClient';

export function criarCliente(dados: CreateClientData) {
    return postJson<CreateClientResponse>('/clientes', dados);
}
