import { Q } from '@nozbe/watermelondb';
import database from '../database';
import Measurement from '../models/MeasurementModel';
import { construirFhirGlicose, construirFhirPressao } from './fhirBuilder';
import type { MedicaoLocal } from '../../types/localData.types';
import type {
    ContextoGlicose,
    PerfilReferenciaGlicose,
    ResultadoReferenciaGlicose,
} from '../../types/glicose.types';
import { formatarDataHoraCurta } from '../../utils/dateTime';

const collection = database.get<Measurement>('measurements');

export async function salvarMedicaoGlicose(
    valorMgDl: number,
    idCliente: string,
    contexto: ContextoGlicose,
    perfilReferencia: PerfilReferenciaGlicose,
    classificacao: ResultadoReferenciaGlicose,
): Promise<Measurement> {
    const agora = new Date();
    const fhir = construirFhirGlicose({
        valorMgDl,
        idPaciente: idCliente,
        dataHora: agora,
        contexto,
        perfilReferencia,
        classificacao,
    });

    return database.write(async () => {
        return collection.create((registro) => {
            registro.clienteId = idCliente;
            registro.tipoMedicaoId = 'glicose';
            registro.dataHora = agora;
            registro.fhirPayload = JSON.stringify(fhir);
            registro.isCritico = false;
            registro.statusSincronizacao = 'PENDENTE';
        });
    });
}

export async function salvarMedicaoPressao(
    sistolica: number,
    diastolica: number,
    idCliente: string,
): Promise<Measurement> {
    const agora = new Date();
    const fhir = construirFhirPressao({
        sistolica,
        diastolica,
        idPaciente: idCliente,
        dataHora: agora,
    });

    return database.write(async () => {
        return collection.create((registro) => {
            registro.clienteId = idCliente;
            registro.tipoMedicaoId = 'pressao';
            registro.dataHora = agora;
            registro.fhirPayload = JSON.stringify(fhir);
            registro.isCritico = false;
            registro.statusSincronizacao = 'PENDENTE';
        });
    });
}

export async function listarTodasMedicoes(): Promise<MedicaoLocal[]> {
    const registros = await collection.query(Q.sortBy('data_hora', Q.desc)).fetch();

    return registros.map((registro) => {
        const fhir = registro.parsedFhir;
        let tipo: MedicaoLocal['tipo'];
        let valor: string;
        let data: string;
        let contexto: MedicaoLocal['contexto'] = undefined;
        let perfilReferencia: MedicaoLocal['perfilReferencia'] = undefined;
        let classificacao: MedicaoLocal['classificacao'] = undefined;

        if (registro.tipoMedicaoId === 'glicose') {
            tipo = 'Glicose';
            const quantidade = (fhir as any)?.valueQuantity;
            valor = quantidade ? String(quantidade.value) + ' mg/dL' : '-- mg/dL';
            const extensoes = (fhir as any)?.extension ?? [];
            contexto = extensoes.find(
                (ext: { url?: string }) => ext.url === 'http://seu-app.com/fhir/contexto-medicao',
            )?.valueString;
            perfilReferencia = extensoes.find(
                (ext: { url?: string }) => ext.url === 'http://seu-app.com/fhir/perfil-referencia-glicose',
            )?.valueString;
            const status = extensoes.find(
                (ext: { url?: string }) => ext.url === 'http://seu-app.com/fhir/classificacao-referencia-glicose',
            )?.valueString;
            const faixa = extensoes.find(
                (ext: { url?: string }) => ext.url === 'http://seu-app.com/fhir/faixa-referencia-glicose',
            )?.valueString;
            if (status && faixa) {
                const rotulos: Record<string, string> = {
                    DENTRO_DA_META: 'Dentro da meta',
                    ABAIXO_DA_META: 'Abaixo da meta',
                    ACIMA_DA_META: 'Acima da meta',
                    SEM_FAIXA: 'Sem faixa de referência',
                };
                classificacao = {
                    status,
                    rotulo: rotulos[status] ?? 'Sem classificação',
                    faixa,
                };
            }
        } else {
            tipo = 'Pressão';
            const componentes = (fhir as any)?.component;
            if (Array.isArray(componentes) && componentes.length >= 2) {
                const sistolica = componentes[0]?.valueQuantity?.value ?? '--';
                const diastolica = componentes[1]?.valueQuantity?.value ?? '--';
                valor = String(sistolica) + ' / ' + String(diastolica) + ' mmHg';
            } else {
                valor = '-- / -- mmHg';
            }
        }

        const effectiveDateTime = (fhir as any)?.effectiveDateTime;
        data = effectiveDateTime
            ? formatarDataHoraCurta(effectiveDateTime)
            : formatarDataHoraCurta(registro.dataHora ?? registro.createdAt ?? new Date());

        const dataIso = effectiveDateTime ?? registro.dataHora?.toISOString() ?? '';
        const statusSincronizacao = registro.statusSincronizacao === 'ENVIADO'
            ? 'ENVIADO'
            : 'PENDENTE';
        return { id: registro.id, tipo, valor, data, dataIso, statusSincronizacao, contexto, perfilReferencia, classificacao };
    });
}

export type DadosEdicaoMedicao =
    | { tipo: 'Glicose'; valorMgDl: number; contexto: ContextoGlicose; perfilReferencia: PerfilReferenciaGlicose; classificacao: ResultadoReferenciaGlicose }
    | { tipo: 'Pressão'; sistolica: number; diastolica: number };

export async function atualizarMedicao(id: string, dados: DadosEdicaoMedicao): Promise<void> {
    await database.write(async () => {
        const registro = await collection.find(id);
        const fhir = dados.tipo === 'Glicose'
            ? construirFhirGlicose({
                  valorMgDl: dados.valorMgDl,
                  idPaciente: registro.clienteId,
                  dataHora: registro.dataHora,
                  contexto: dados.contexto,
                  perfilReferencia: dados.perfilReferencia,
                  classificacao: dados.classificacao,
              })
            : construirFhirPressao({
                  sistolica: dados.sistolica,
                  diastolica: dados.diastolica,
                  idPaciente: registro.clienteId,
                  dataHora: registro.dataHora,
              });

        await registro.update((medicao) => {
            medicao.tipoMedicaoId = dados.tipo === 'Glicose' ? 'glicose' : 'pressao';
            medicao.fhirPayload = JSON.stringify(fhir);
            medicao.statusSincronizacao = 'PENDENTE';
        });
    });
}

export async function excluirMedicao(id: string): Promise<void> {
    await database.write(async () => {
        const registro = await collection.find(id);
        await registro.markAsDeleted();
    });
}

export async function listarPendentes(): Promise<Measurement[]> {
    return collection.query(Q.where('sync_status', 'PENDENTE')).fetch();
}

export async function marcarComoEnviado(id: string): Promise<void> {
    await database.write(async () => {
        const registro = await collection.find(id);
        await registro.update((r) => {
            r.statusSincronizacao = 'ENVIADO';
        });
    });
}
