import { Model } from '@nozbe/watermelondb';
import { text, field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class Alarm extends Model {
  static table = 'alarms';

  @text('cliente_id') clienteId: string;
  @text('tipo_medicao_id') tipoMedicaoId: string;
  @text('horario') horario: string;
  @field('notificacao_ativa') notificacaoAtiva: boolean;
  @text('frequencia') frequencia: string;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
}
