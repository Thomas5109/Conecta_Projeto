import { FastifyRequest, FastifyReply } from "fastify"
import jwt from '@fastify/jwt'

export async function verifyJwt(
    request: FastifyRequest, 
    reply: FastifyReply,
) {
    try{
        await request.jwtVerify();
    
    } catch (error) {
        return reply.code(401).send({
            error: 'Token inválido ou ausente',
        });
    }
}