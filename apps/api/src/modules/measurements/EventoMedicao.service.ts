import { EventoMedicaoRepository, WatermelonPushChanges } from './eventoMedicao.repository.js';
import { Prisma } from '@prisma/client';

export class EventoMedicaoService {
  // Injeção de dependência: o Service recebe o Repositório no construtor
  constructor(private readonly eventoRepo: EventoMedicaoRepository) {}

  /**
   * PULL: Processa a requisição do celular para baixar dados.
   * Retorna os dados no formato exato que o protocolo do WatermelonDB exige.
   */
  async pullSyncService(lastPulledAt: number | null | undefined, idCliente: string) {
    // 1. Validação da Data: Se for 0, nulo ou vazio, consideramos a primeira instalação (Epoch time: 1970)
    const validTimestamp = lastPulledAt ? new Date(lastPulledAt) : new Date(0);

    // 2. Busca os dados brutos através do Repositório
    const rawRecords = await this.eventoRepo.getMeasurementsSince(validTimestamp, idCliente);

    // 3. Formatação da Resposta para o WatermelonDB
    const created: any[] = [];
    const updated: any[] = [];
    const deleted: string[] = [];

    for (const record of rawRecords) {
      if (record.deleted_at) {
        // Se tem deleted_at, o app deve deletar localmente
        deleted.push(record.id_evento_medicao);
      } else if (!lastPulledAt && record.created_at > validTimestamp) {
        // Só envia como 'created' na carga inicial; nas próximas, envia como 'updated'
        created.push({ ...record, id: record.id_evento_medicao });
      } else {
        // Se foi criado ANTES, mas foi alterado recentemente, é um update
        updated.push({ ...record, id: record.id_evento_medicao });
      }
    }

    return {
      changes: {
        evento_medicao: {
          created,
          updated,
          deleted,
        },
      },
      timestamp: Date.now(), // Timestamp do servidor no momento exato do PULL
    };
  }

  /**
   * PUSH: Processa os dados que o celular está enviando.
   * Aplica validações clínicas de domínio e estruturais (HL7 FHIR) antes de salvar.
   */
  async pushSyncService(
    syncPayload: WatermelonPushChanges<Prisma.EventoMedicaoUncheckedCreateInput>,
    idCliente: string
  ) {
    // Une as listas de criações e atualizações para aplicar a mesma validação clínica em ambas
    const recordsToValidate = [...syncPayload.created, ...syncPayload.updated];

    for (const record of recordsToValidate) {
      this.validarRegrasClinicasEFHIR(record);
    }

    // Se o código chegou até aqui sem disparar erros (throw), repassa para a transação segura do Repositório
    await this.eventoRepo.processPushChanges(syncPayload, idCliente);
  }

  /**
   * Função privada (cápsula de domínio) para isolar as validações pesadas
   */
  private validarRegrasClinicasEFHIR(record: Prisma.EventoMedicaoUncheckedCreateInput) {
    const fhirPayload = record.fhir_observation_payload as any;

    if (!fhirPayload || typeof fhirPayload !== 'object') {
      throw new Error(`Payload ausente ou inválido no evento ${record.id_evento_medicao}`);
    }

    // 1. Validação Semântica do Padrão HL7 FHIR
    if (fhirPayload.resourceType !== 'Observation') {
      throw new Error("O 'resourceType' deve ser obrigatoriamente 'Observation'.");
    }
    if (!['registered', 'preliminary', 'final', 'amended'].includes(fhirPayload.status)) {
      throw new Error(`Status FHIR inválido: ${fhirPayload.status}`);
    }

    // 2. Extração do código LOINC
    const loincCode = fhirPayload.code?.coding?.[0]?.code;

    // 3. Validações de Domínio Clínico + Vínculo com o Seed de tipo_medicao
    if (loincCode === '41653-7') {
      const measurementValue = fhirPayload.valueQuantity?.value;
      const ucumUnit = fhirPayload.valueQuantity?.unit;

      if (typeof measurementValue !== 'number') {
        throw new Error('O valor da glicemia (valueQuantity.value) deve ser numérico.');
      }
      if (ucumUnit !== 'mg/dL') {
        throw new Error("A unidade para Glicemia deve ser 'mg/dL' (padrão UCUM).");
      }
      if (measurementValue < 10 || measurementValue > 900) {
        throw new Error(`Valor de glicemia clinicamente irreal: ${measurementValue} mg/dL.`);
      }

      // Garante a FK com o registro '1' (Glicose) do seed
      record.id_tipo_medicao = '1';
    } else if (loincCode === '85354-9') {
      const componentes = Array.isArray(fhirPayload.component) ? fhirPayload.component : [];

      if (componentes.length > 0) {
        for (const comp of componentes) {
          const valor = comp.valueQuantity?.value;
          const unidade = comp.valueQuantity?.unit;

          if (typeof valor !== 'number' || valor <= 0 || valor > 300) {
            throw new Error(`Valor de pressão arterial clinicamente irreal: ${valor} mmHg.`);
          }
          if (unidade !== 'mm[Hg]') {
            throw new Error("A unidade para Pressão Arterial deve ser 'mm[Hg]' (padrão UCUM).");
          }
        }
      } else {
        const measurementValue = fhirPayload.valueQuantity?.value;
        const ucumUnit = fhirPayload.valueQuantity?.unit;

        if (typeof measurementValue !== 'number') {
          throw new Error('O valor da pressão arterial deve ser numérico.');
        }
        if (ucumUnit !== 'mm[Hg]') {
          throw new Error("A unidade para Pressão Arterial deve ser 'mm[Hg]' (padrão UCUM).");
        }
        if (measurementValue <= 0 || measurementValue > 300) {
          throw new Error(`Valor de pressão arterial clinicamente irreal: ${measurementValue} mmHg.`);
        }
      }

      // Garante a FK com o registro '2' (Pressão Arterial) do seed
      record.id_tipo_medicao = '2';
    } else {
      throw new Error(`Código LOINC não suportado ou ausente: ${loincCode}`);
    }
  }
}