import { Model } from '@nozbe/watermelondb';
import { text, date, field, readonly } from '@nozbe/watermelondb/decorators';


export default class Measurement extends Model {
  static table = 'measurements';

  @text('cliente_id') declare clienteId: string;
  @text('tipo_medicao_id') declare tipoMedicaoId: string;
  @date('data_hora') declare dataHora: Date;
  @text('fhir_payload') declare fhirPayload: string;
  @field('is_critico') declare isCritico: boolean;

  // NOME ALTERADO AQUI PARA EVITAR O CONFLITO COM O WATERMELONDB
  // mas mantenha o vínculo com a coluna 'sync_status' do SQLite
  @text('sync_status') declare statusSincronizacao: string;

  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;

  /** Retorna o payload FHIR parseado ou null em caso de erro */
  get parsedFhir(): Record<string, unknown> | null {
    try {
      return JSON.parse(this.fhirPayload);
    } catch {
      return null;
    }
  }
}
