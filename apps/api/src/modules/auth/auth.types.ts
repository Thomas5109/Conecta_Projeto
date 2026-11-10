// Formato dos dados recebidos pela API na rota de login.
export interface LoginBody {
    email: string;
    senha: string;
}

// Formato dos dados que o PostgreSQL retorna ao buscar um usuário.
export interface UsuarioRow {
    id_usuario: string;
    email: string;
    senha: string;
    status_da_conta: string;
    tipo_usuario: string;
    id_cliente: string | null;
    nome: string | null;
}
