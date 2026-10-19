const API_URL =
    process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000';

export interface LoginResponse {
    mensagem: string;

    usuario: {
        idUsuario: number;
        email: string;
        tipoUsuario: string;

        cliente: {
            idCliente: number;
            nome: string | null;
        } | null;
    };
}

interface ErroApi {
    erro?: string;
}

export async function fazerLogin(
    email: string,
    senha: string
): Promise<LoginResponse> {
    let resposta: Response;

    try {
        resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                email,
                senha,
            }),
        });
    } catch {
        throw new Error(
            'Não foi possível conectar ao servidor. Verifique se a API está ligada.'
        );
    }

    const dados: LoginResponse | ErroApi =
        await resposta.json();

    if (!resposta.ok) {
        const erroApi = dados as ErroApi;

        throw new Error(
            erroApi.erro ?? 'Não foi possível realizar o login.'
        );
    }

    return dados as LoginResponse;
}