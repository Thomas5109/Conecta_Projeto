export interface MedicaoLocal {
    id: string;
    tipo: 'Glicose' | 'Pressão';
    valor: string;
    data: string;
}

export interface LembreteLocal {
    id: string;
    titulo: string;
    horario: string;
}

export interface ContatoLocal {
    id: string;
    nome: string;
    telefone: string;
    parentesco: string;
}

export interface UsuarioLocal {
    idUsuario: number;
    idCliente: number | null;
    nome: string;
    email: string;
    tipoUsuario: string;
}
