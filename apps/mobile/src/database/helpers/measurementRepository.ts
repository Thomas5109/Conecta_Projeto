import { Q } from '@nozbe/watermelondb';
import database from '../database';
import Measurement from '../models/MeasurementModel';
import { construirFhirGlicose, construirFhirPressao } from './fhirBuilder';
import type { MedicaoLocal } from '../../types/localData.types';

const collection = database.get<Measurement>('measurements');

/**
 * Salva uma medição de glicose no banco local com payload FHIR.
 */
export async function salvarMedicaoGlicose(
    valorMgDl: number,
    idCliente: string,
): Promise<Measurement> {
    const agora = new Date();

    const fhir = construirFhirGlicose({
        valorMgDl,
        idPaciente: idCliente,
        dataHora: agora,
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

/**
 * Salva uma medição de pressão arterial no banco local com payload FHIR.
 */
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

/**
 * Lista todas as medições convertidas para o formato MedicaoLocal,
 * ordenadas por data_hora decrescente.
 */
export async function listarTodasMedicoes(): Promise<MedicaoLocal[]> {
    const registros = await collection
        .query(Q.sortBy('data_hora', Q.desc))
        .fetch();

    return registros.map((registro) => {
        const fhir = registro.parsedFhir;
        let tipo: MedicaoLocal['tipo'];
        let valor: string;
        let data: string;

        if (registro.tipoMedicaoId === 'glicose') {
            tipo = 'Glicose';
            const vq = (fhir as any)?.valueQuantity;
            valor = vq ? `${vq.value} mg/dL` : '-- mg/dL';
        } else {
            tipo = 'Pressão';
            const componentes = (fhir as any)?.component;
            if (Array.isArray(componentes) && componentes.length >= 2) {
                const sys = componentes[0]?.valueQuantity?.value ?? '--';
                const dia = componentes[1]?.valueQuantity?.value ?? '--';
                valor = `${sys} / ${dia} mmHg`;
            } else {
                valor = '-- / -- mmHg';
            }
        }

        // Formata a data a partir do effectiveDateTime do FHIR ou do created_at
        const effectiveDateTime = (fhir as any)?.effectiveDateTime;
        if (effectiveDateTime) {
            data = new Date(effectiveDateTime).toLocaleString('pt-BR');
        } else {
            data = registro.createdAt
                ? registro.createdAt.toLocaleString('pt-BR')
                : '';
        }

        return { id: registro.id, tipo, valor, data };
    });
}

/**
 * Lista as medições com sync_status = 'PENDENTE'.
 */
export async function listarPendentes(): Promise<Measurement[]> {
    return collection
        .query(Q.where('sync_status', 'PENDENTE'))
        .fetch();
}

/**
 * Marca uma medição como enviada (sync_status = 'ENVIADO').
 */
export async function marcarComoEnviado(id: string): Promise<void> {
    await database.write(async () => {
        const registro = await collection.find(id);
        await registro.update((r) => {
            r.statusSincronizacao = 'ENVIADO';
        });
    });
}
