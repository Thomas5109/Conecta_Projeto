// Formato dos dados recebidos pela API ao criar um cliente.
export interface CreateClientBody {
    cpf: string;
    email: string;
    senha: string;
    nome: string;
    telefone: string;
    data_de_nascimento: string;
    sexo: string;
}

// Formato dos dados que o PostgreSQL retorna ao criar um cliente.
export interface ClientRow {
    id_cliente: number;
    id_usuario: number;
    nome: string;
    telefone: string;
    data_de_nascimento: string;
    sexo: string;
}