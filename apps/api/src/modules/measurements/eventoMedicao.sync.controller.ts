import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { EventoMedicaoService } from './EventoMedicao.service.js';

export class SyncController {
  // Injeta o Service no Controller para manter o baixo acoplamento
  constructor(private readonly eventoService: EventoMedicaoService) {}

  /**
   * GET /sync?last_pulled_at=1690000000
   * Extrai o parâmetro, chama o serviço e devolve os dados para o celular.
   */
  async pull(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Schema Zod para extrair e converter o parâmetro da URL (Query String)
      // O coerce.number() transforma a string da URL em número automaticamente
      const pullQuerySchema = z.object({
        last_pulled_at: z.coerce.number().optional().nullable(),
      });

      const { last_pulled_at } = pullQuerySchema.parse(request.query);

      // 2. Segurança: Identificação do Usuário (Multi-tenant)
      // Em uma API real, esse ID vem do seu middleware de Autenticação (ex: JWT)
      // Estamos simulando a extração do token interceptado pelo Fastify
      const idCliente = (request.user as any)?.id_cliente; 
      
      if (!idCliente) {
        return reply.status(401).send({ error: 'Usuário não autenticado.' });
      }

      // 3. Chama o Service
      const responsePayload = await this.eventoService.pullSyncService(last_pulled_at, idCliente);

      // 4. Retorna a resposta ao WatermelonDB
      return reply.status(200).send(responsePayload);

    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * POST /sync
   * Recebe as alterações feitas no celular offline e repassa para o servidor.
   */
  async push(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Schema Zod para validar a árvore JSON enviada pelo WatermelonDB
      const pushBodySchema = z.object({
        changes: z.object({
          evento_medicao: z.object({
            created: z.array(z.any()),
            updated: z.array(z.any()),
            deleted: z.array(z.string()), // O WatermelonDB envia apenas os IDs (strings) para deleção
          }),
        }),
      });

      const { changes } = pushBodySchema.parse(request.body);

      // 2. Extrai as listas específicas da tabela evento_medicao
      const payloadMedicoes = changes.evento_medicao;

      // 3. Segurança: Extrai o ID do cliente autenticado
      const idCliente = (request.user as any)?.id_cliente;

      if (!idCliente) {
        return reply.status(401).send({ error: 'Usuário não autenticado.' });
      }

      // 4. Chama o Service (que fará as validações clínicas e do FHIR)
      await this.eventoService.pushSyncService(payloadMedicoes, idCliente);

      // 5. Sucesso absoluto (Tudo ou Nada concluído com sucesso)
      return reply.status(200).send({ success: true });

    } catch (error) {
      return this.handleError(error, reply);
    }
  }

  /**
   * Método utilitário para formatar os erros devolvidos ao aplicativo
   */
  private handleError(error: any, reply: FastifyReply) {
    // Se o erro for de validação do Zod (ex: payload enviado com formato errado)
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        error: 'Dados de sincronização mal formatados.',
        detalhes: error.format()
      });
    }

    // Se o erro foi disparado pelo nosso Service (ex: Glicemia absurda ou FHIR inválido)
    if (error instanceof Error) {
      return reply.status(400).send({ error: error.message });
    }

    // Erro catastrófico não mapeado (ex: banco de dados caiu)
    console.error('Erro crítico na sincronização:', error);
    return reply.status(500).send({ error: 'Erro interno no servidor de sincronização.' });
  }
}