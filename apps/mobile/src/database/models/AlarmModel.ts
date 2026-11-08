import { Model } from '@nozbe/watermelondb';
import { text, field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Alarm extends Model {
  static table = 'alarms';

  @text('cliente_id') declare clienteId: string;
  @text('tipo_medicao_id') declare tipoMedicaoId: string;
  @text('horario') declare horario: string;
  @field('notificacao_ativa') declare notificacaoAtiva: boolean;
  @text('frequencia') declare frequencia: string;
  @readonly @date('created_at') declare createdAt: Date;
  @readonly @date('updated_at') declare updatedAt: Date;
}
