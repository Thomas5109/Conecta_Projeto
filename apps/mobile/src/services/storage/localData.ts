import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    listarTodasMedicoes,
    salvarMedicaoGlicose,
    salvarMedicaoPressao,
} from '../../database/helpers/measurementRepository';
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

async function ler<T>(chave: string, valorPadrao: T): Promise<T> {
    try {
        const conteudo = await AsyncStorage.getItem(chave);
        return conteudo ? (JSON.parse(conteudo) as T) : valorPadrao;
    } catch {
        return valorPadrao;
    }
}

async function gravar<T>(chave: string, valor: T): Promise<void> {
    await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

export async function listarMedicoes(): Promise<MedicaoLocal[]> {
    return listarTodasMedicoes();
}

export async function adicionarMedicao(medicao: MedicaoLocal): Promise<void> {
    // A tabela guarda cliente_id como string; o ID vem do usuário autenticado.
    // Sem sessão, mantém a medição no dispositivo e pendente para sincronização.
    const usuario = await lerUsuario();
    const idCliente = usuario?.idCliente == null ? 'local' : String(usuario.idCliente);

    if (medicao.tipo === 'Glicose') {
        const valor = Number(medicao.valor.replace(',', '.').match(/-?\d+(?:\.\d+)?/)?.[0]);
        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error('Valor de glicose inválido.');
        }
        await salvarMedicaoGlicose(valor, idCliente);
        return;
    }

    const valores = medicao.valor.match(/-?\d+(?:[.,]\d+)?/g) ?? [];
    const sistolica = Number(valores[0]?.replace(',', '.'));
    const diastolica = Number(valores[1]?.replace(',', '.'));
    if (!Number.isFinite(sistolica) || !Number.isFinite(diastolica) || sistolica <= 0 || diastolica <= 0) {
        throw new Error('Valores de pressão inválidos.');
    }
    await salvarMedicaoPressao(sistolica, diastolica, idCliente);
}

export async function listarLembretes(): Promise<LembreteLocal[]> {
    const registros = await ler<Array<Partial<LembreteLocal>>>(
        CHAVES_DADOS_LOCAIS.lembretes,
        []
    );

    return registros.map((registro, indice) => ({
        id: registro.id ?? 'lembrete-' + indice,
        titulo: registro.titulo ?? '',
        horario: normalizarHorario(registro.horario ?? '') ?? registro.horario ?? '',
    }));
}

export function salvarLembretes(lembretes: LembreteLocal[]): Promise<void> {
    return gravar(CHAVES_DADOS_LOCAIS.lembretes, lembretes);
}

export function listarContatos(): Promise<ContatoLocal[]> {
    return ler(CHAVES_DADOS_LOCAIS.contatos, []);
}

export function salvarContatos(contatos: ContatoLocal[]): Promise<void> {
    return gravar(CHAVES_DADOS_LOCAIS.contatos, contatos);
}

export function lerUsuario(): Promise<UsuarioLocal | null> {
    return ler<UsuarioLocal | null>(CHAVES_DADOS_LOCAIS.usuario, null);
}

export function salvarUsuario(usuario: UsuarioLocal): Promise<void> {
    return gravar(CHAVES_DADOS_LOCAIS.usuario, usuario);
}

export function removerUsuario(): Promise<void> {
    return AsyncStorage.removeItem(CHAVES_DADOS_LOCAIS.usuario);
}

