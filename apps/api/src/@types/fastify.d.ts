import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id_cliente: string };
    user: { id_cliente: string };
  }
}