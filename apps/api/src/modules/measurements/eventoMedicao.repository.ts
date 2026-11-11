import prisma from '../../infrastructure/database/Prisma.database.js';
import { Prisma, EventoMedicao } from '@prisma/client';

// Tipagem padrão do payload de Push do WatermelonDB
export type WatermelonPushChanges<T> = {
  created: T[];
  updated: T[];
  deleted: string[]; // O Watermelon envia apenas um array de IDs para os deletados
};

export class EventoMedicaoRepository {
  
  /**
   * PULL: Busca todos os registros alterados desde a última sincronização.
   * Filtramos também pelo cliente, garantindo que o usuário baixe apenas os próprios dados.
   */
  async getMeasurementsSince(lastPulledAt: Date, idCliente: string): Promise<EventoMedicao[]> {
    return await prisma.eventoMedicao.findMany({
      where: {
        id_cliente: idCliente,
        updated_at: {
          gt: lastPulledAt, // greater than (maior que) o timestamp recebido
        },
      },
    });
  }

  /**
   * PUSH: Processa as alterações locais do celular aplicando a regra "Tudo ou Nada".
   */
  async processPushChanges(
    changes: WatermelonPushChanges<Prisma.EventoMedicaoUncheckedCreateInput>, 
    idCliente: string
  ): Promise<void> {
    const { created, updated, deleted } = changes;
    
    // Array que armazenará todas as operações para a transação
    const operacoes = [];

    // 1. CREATE: Adiciona a operação de criação em lote (mais performático)
    if (created.length > 0) {
      // Garantimos que todos os registros criados pertençam ao cliente da requisição
      const recordsToCreate = created.map(record => ({
        ...record,
        id_cliente: idCliente 
      }));

      operacoes.push(
        prisma.eventoMedicao.createMany({
          data: recordsToCreate,
          skipDuplicates: true, // Evita erro se o celular tentar reenviar algo já criado
        })
      );
    }

    // 2. UPDATE: Adiciona um update individual para cada registro modificado
    if (updated.length > 0) {
      for (const record of updated) {
        operacoes.push(
          prisma.eventoMedicao.update({
            where: { 
              id_evento_medicao: record.id_evento_medicao 
            },
            data: {
              // Os dados vêm do celular, mas forçamos a proteção do id do cliente
              id_tipo_medicao: record.id_tipo_medicao,
              data_hora_do_evento: record.data_hora_do_evento,
              fhir_observation_payload: record.fhir_observation_payload,
              // O próprio Prisma vai gerenciar o updated_at no banco
            }
          })
        );
      }
    }

    // 3. DELETE (Soft Delete): Adiciona a operação para marcar como deletado
    if (deleted.length > 0) {
      for (const id_evento of deleted) {
        operacoes.push(
          prisma.eventoMedicao.update({
            where: { 
              id_evento_medicao: id_evento 
            },
            data: { 
              deleted_at: new Date() // Soft delete ativado
            }
          })
        );
      }
    }

    // Executa todas as operações preparadas em uma única transação no PostgreSQL
    // Se qualquer uma falhar, o banco desfaz (rollback) as anteriores automaticamente.
    if (operacoes.length > 0) {
      await prisma.$transaction(operacoes);
    }
  }
}