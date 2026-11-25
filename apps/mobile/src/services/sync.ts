import { Alert } from 'react-native';
import { synchronize } from '@nozbe/watermelondb/sync';
import database from '../database/database';
import { lerToken, removerToken } from './storage/tokenStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.100.6:3000';

let syncEmAndamento: Promise<boolean> | null = null;

async function tratarErroResposta(
  response: Response,
  etapa: 'PULL' | 'PUSH',
): Promise<never> {
  if (response.status === 401) {
    await removerToken();
    const mensagem =
      'Sua sessão expirou. Entre novamente na sua conta para retomar o backup na nuvem.';
    Alert.alert('Sessão expirada', mensagem);
    throw new Error(mensagem);
  }

  const erroTexto = await response.text();
  throw new Error(`Erro no ${etapa} (${response.status}): ${erroTexto}`);
}

// Converte registro do PostgreSQL (evento_medicao) -> SQLite do WatermelonDB (measurements)
function mapearServidorParaLocal(record: any) {
  return {
    id: record.id_evento_medicao ?? record.id,
    cliente_id: record.id_cliente,
    tipo_medicao_id: record.id_tipo_medicao,
    data_hora: new Date(record.data_hora_do_evento).getTime(),
    fhir_payload:
      typeof record.fhir_observation_payload === 'string'
        ? record.fhir_observation_payload
        : JSON.stringify(record.fhir_observation_payload),
    is_critico: Boolean(record.is_critico ?? false),
    sync_status: 'sincronizado',
    created_at: new Date(record.created_at).getTime(),
    updated_at: new Date(record.updated_at).getTime(),
  };
}

// Converte registro cru do WatermelonDB (measurements) -> Payload esperado pela API (evento_medicao)
function mapearLocalParaServidor(raw: any) {
  return {
    id_evento_medicao: raw.id,
    id_tipo_medicao: raw.tipo_medicao_id,
    data_hora_do_evento: new Date(raw.data_hora).toISOString(),
    fhir_observation_payload:
      typeof raw.fhir_payload === 'string'
        ? JSON.parse(raw.fhir_payload)
        : raw.fhir_payload,
  };
}

export function syncData(): Promise<boolean> {
  if (syncEmAndamento) {
    return syncEmAndamento;
  }

  syncEmAndamento = (async () => {
    const token = await lerToken();

    if (!token) {
      return false;
    }

    await synchronize({
      database,
      sendCreatedAsUpdated: true,

      // 1. PULL: Baixa de evento_medicao e entrega como measurements para o WatermelonDB
      pullChanges: async ({ lastPulledAt }) => {
        const urlParams = lastPulledAt ? `?last_pulled_at=${lastPulledAt}` : '';

        const response = await fetch(`${API_URL}/sync${urlParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          await tratarErroResposta(response, 'PULL');
        }

        const { changes, timestamp } = await response.json();
        const eventoMedicao = changes?.evento_medicao ?? {
          created: [],
          updated: [],
          deleted: [],
        };

        return {
          changes: {
            measurements: {
              created: (eventoMedicao.created ?? []).map(mapearServidorParaLocal),
              updated: (eventoMedicao.updated ?? []).map(mapearServidorParaLocal),
              deleted: eventoMedicao.deleted ?? [],
            },
            alarms: {
              created: [],
              updated: [],
              deleted: [],
            },
          },
          timestamp,
        };
      },

      // 2. PUSH: Extrai measurements locais e envia como evento_medicao para o Fastify
      pushChanges: async ({ changes }) => {
        const measurements = (changes as any)?.measurements ?? {
          created: [],
          updated: [],
          deleted: [],
        };

        const payloadBackend = {
          changes: {
            evento_medicao: {
              created: (measurements.created ?? []).map(mapearLocalParaServidor),
              updated: (measurements.updated ?? []).map(mapearLocalParaServidor),
              deleted: measurements.deleted ?? [],
            },
          },
        };

        const response = await fetch(`${API_URL}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadBackend),
        });

        if (!response.ok) {
          await tratarErroResposta(response, 'PUSH');
        }
      },
    });

    return true;
  })().finally(() => {
    syncEmAndamento = null;
  });

  return syncEmAndamento;
}