import { API_URL } from './apiConfig';

interface ApiErrorBody {
    erro?: string;
    message?: string;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
    let response: Response;

    try {
        response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
    } catch {
        throw new Error(
            'Não foi possível conectar ao servidor. Confira se a API está ligada e se o endereço está correto.'
        );
    }

    let data: unknown;

    try {
        data = await response.json();
    } catch {
        throw new Error('A API retornou uma resposta inválida.');
    }

    if (!response.ok) {
        const apiError = (data && typeof data === 'object' ? data : {}) as ApiErrorBody;
        throw new Error(
            apiError.erro ?? apiError.message ?? 'Não foi possível concluir a solicitação.'
        );
    }

    return data as T;
}

