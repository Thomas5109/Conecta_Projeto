import prisma from '../../infrastructure/database/Prisma.database.js';
import { Prisma, EventoMedicao } from '@prisma/client';

// Tipagem padrão do payload de Push do WatermelonDB
export type WatermelonPushChanges<T> = {
  created: T[];
  updated: T[];
  deleted: string[];
};

export class EventoMedicaoRepository {
  /**
   * PULL: Busca todos os registros alterados desde a última sincronização,
   * isolando estritamente pelo cliente autenticado no JWT.
   */
  async getMeasurementsSince(lastPulledAt: Date, idCliente: string): Promise<EventoMedicao[]> {
    return await prisma.eventoMedicao.findMany({
      where: {
        id_cliente: idCliente,
        updated_at: {
          gt: lastPulledAt,
        },
      },
    });
  }

  /**
   * PUSH: Processa as alterações locais do celular aplicando a regra "Tudo ou Nada".
   */
  async processPushChanges(
    changes: WatermelonPushChanges<Prisma.EventoMedicaoUncheckedCreateInput>,
    idCliente: string,
  ): Promise<void> {
    const { created, updated, deleted } = changes;
    const operacoes = [];

    // 1. CREATE: Filtra apenas as colunas válidas do Postgres e força o id_cliente do JWT
    if (created.length > 0) {
      const recordsToCreate = created.map((record) => ({
        id_evento_medicao: record.id_evento_medicao ?? (record as any).id,
        id_cliente: idCliente,
        id_tipo_medicao: record.id_tipo_medicao,
        data_hora_do_evento: new Date(record.data_hora_do_evento),
        fhir_observation_payload: record.fhir_observation_payload,
      }));

      operacoes.push(
        prisma.eventoMedicao.createMany({
          data: recordsToCreate,
          skipDuplicates: true,
        }),
      );
    }

    // 2. UPDATE: Exige que o registro pertença ao id_cliente autenticado
    if (updated.length > 0) {
      for (const record of updated) {
        const idEvento = record.id_evento_medicao ?? (record as any).id;

        operacoes.push(
          prisma.eventoMedicao.updateMany({
            where: {
              id_evento_medicao: idEvento,
              id_cliente: idCliente,
            },
            data: {
              id_tipo_medicao: record.id_tipo_medicao,
              data_hora_do_evento: new Date(record.data_hora_do_evento),
              fhir_observation_payload: record.fhir_observation_payload,
            },
          }),
        );
      }
    }

    // 3. DELETE (Soft Delete): Marca como deletado em lote apenas registros do próprio cliente
    if (deleted.length > 0) {
      operacoes.push(
        prisma.eventoMedicao.updateMany({
          where: {
            id_evento_medicao: { in: deleted },
            id_cliente: idCliente,
          },
          data: {
            deleted_at: new Date(),
          },
        }),
      );
    }

    if (operacoes.length > 0) {
      await prisma.$transaction(operacoes);
    }
  }
}