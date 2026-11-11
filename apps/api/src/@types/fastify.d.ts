import 'fastify';

// Sobrescreve e expande a tipagem original do Fastify
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id_cliente: string;
      // Você pode adicionar outros campos que seu token JWT guarda aqui, ex:
      email: string;
      // role: string;
    };
  }
}