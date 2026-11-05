export type SexoCliente = 'MASCULINO' | 'FEMININO' | 'OUTRO';

export interface CreateClientData {
    cpf: string;
    email: string;
    senha: string;
    nome: string;
    telefone: string;
    data_de_nascimento: string;
    sexo: SexoCliente;
}

export interface CreateClientResponse {
    mensagem: string;
    cliente: {
        id_cliente: number;
        id_usuario: number;
        nome: string;
        telefone: string;
        data_de_nascimento: string;
        sexo: SexoCliente;
    };
}
