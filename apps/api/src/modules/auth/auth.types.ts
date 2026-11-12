export type LoginBody =
    | { email: string; senha: string; cpf?: never }
    | { cpf: string; senha: string; email?: never };

export interface UsuarioRow {
    id_usuario: string;
    email: string;
    senha: string;
    status_da_conta: string;
    tipo_usuario: string;
    id_cliente: string | null;
    nome: string | null;
}
