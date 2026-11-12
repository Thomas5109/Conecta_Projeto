import type {
    ContatoLocal,
    LembreteLocal,
    MedicaoLocal,
    UsuarioLocal,
} from '../../types/localData.types';
import { normalizarHorario } from '../../utils/dateTime';

export const CHAVES_DADOS_LOCAIS = {
    historico: '@alerta_saude_historico',
    lembretes: '@alertasaude_alarmes',
    contatos: '@alertasaude_contatos',
    usuario: '@alertasaude_usuario',
} as const;

// Armazenamento efêmero em memória RAM (apagado ao fechar ou atualizar a página)
let medicoesMemoria: MedicaoLocal[] = [];
let lembretesMemoria: LembreteLocal[] = [];
let contatosMemoria: ContatoLocal[] = [];
let usuarioMemoria: UsuarioLocal | null = null;

export async function listarMedicoes(): Promise<MedicaoLocal[]> {
    return [...medicoesMemoria];
}

export async function adicionarMedicao(medicao: MedicaoLocal): Promise<void> {
    if (medicao.tipo === 'Glicose') {
        const valor = Number(medicao.valor.replace(',', '.').match(/-?\d+(?:\.\d+)?/)?.[0]);
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error('Valor de glicose inválido.');
        }
    } else {
        const valores = medicao.valor.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
        const sistolica = Number(valores[0]?.replace(',', '.'));
        const diastolica = Number(valores[1]?.replace(',', '.'));
        if (!Number.isFinite(sistolica) || !Number.isFinite(diastolica) || sistolica <= 0 || diastolica <= 0) {
            throw new Error('Valores de pressão inválidos.');
        }
    }

    medicoesMemoria = [
        {
            ...medicao,
            id: medicao.id || Date.now().toString(),
        },
        ...medicoesMemoria,
    ];
}

export async function listarLembretes(): Promise<LembreteLocal[]> {
    return lembretesMemoria.map((registro, indice) => ({
        id: registro.id ?? 'lembrete-' + indice,
        titulo: registro.titulo ?? '',
        horario: normalizarHorario(registro.horario ?? '') ?? registro.horario ?? '',
    }));
}

export async function salvarLembretes(lembretes: LembreteLocal[]): Promise<void> {
    lembretesMemoria = [...lembretes];
}

export async function listarContatos(): Promise<ContatoLocal[]> {
    return [...contatosMemoria];
}

export async function salvarContatos(contatos: ContatoLocal[]): Promise<void> {
    contatosMemoria = [...contatos];
}

export async function lerUsuario(): Promise<UsuarioLocal | null> {
    return usuarioMemoria;
}

export async function salvarUsuario(usuario: UsuarioLocal): Promise<void> {
    usuarioMemoria = usuario;
}

export async function removerUsuario(): Promise<void> {
    usuarioMemoria = null;
}