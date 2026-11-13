import { FastifyInstance } from 'fastify';
import { EventoMedicaoRepository } from './eventoMedicao.repository.js';
import { EventoMedicaoService } from './EventoMedicao.service.js';
import { SyncController } from './eventoMedicao.sync.controller.js';

export async function syncRoutes(fastify: FastifyInstance) {
  // 1. Instancia as dependências "de baixo para cima"
  const repository = new EventoMedicaoRepository();
  const service = new EventoMedicaoService(repository);
  const controller = new SyncController(service);

  // 2. Mapeia os endpoints do Fastify
  fastify.get('/sync', (req, rep) => controller.pull(req, rep));
  fastify.post('/sync', (req, rep) => controller.push(req, rep));
}