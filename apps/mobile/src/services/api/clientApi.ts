const API_URL = 'http://192.168.100.6:3000';

export interface CreateClientData {
    cpf: string;
    email: string;
    senha: string;
    nome: string;
    telefone: string;
    data_de_nascimento: string;
    sexo: string;
}

export async function criarCliente(
    dados: CreateClientData
) {
    const response = await fetch(
        `${API_URL}/clientes`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(dados),
        }
    );

    const resultado = await response.json();

    if (!response.ok) {
        throw new Error(
            resultado.erro ?? 'Erro ao cadastrar cliente.'
        );
    }

    return resultado;
}