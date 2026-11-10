export interface LoginResponse {
    mensagem: string;
    usuario: {
        idUsuario: string | number;
        email: string;
        tipoUsuario: string;
        cliente: {
            idCliente: string | number;
            nome: string | null;
        } | null;
    };
}
