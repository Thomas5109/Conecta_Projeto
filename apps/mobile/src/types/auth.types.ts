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
