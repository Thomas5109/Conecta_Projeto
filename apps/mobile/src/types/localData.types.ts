import type {
    ContextoGlicose,
    PerfilReferenciaGlicose,
    ResultadoReferenciaGlicose,
} from './glicose.types';

export interface MedicaoLocal {
    id: string;
    tipo: 'Glicose' | 'Pressão';
    valor: string;
    data: string;
    dataIso: string;
    statusSincronizacao: 'PENDENTE' | 'ENVIADO';
    contexto?: ContextoGlicose;
    perfilReferencia?: PerfilReferenciaGlicose;
    classificacao?: ResultadoReferenciaGlicose;
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
    idUsuario: string | number;
    idCliente: string | number | null;
    nome: string;
    email: string;
    tipoUsuario: string;
}
