import Fastify from 'fastify';
import { pool } from './infrastructure/database/pool.js';
import { clientRoutes } from './modules/clients/routes.js';

export function buildApp() {
    const app = Fastify({
        logger: true,
    });

    app.get('/health', async () => {
        const result = await pool.query(
            'SELECT NOW() AS agora'
        );

        return {
            status: 'ok',
            database: 'conectado',
            agora: result.rows[0].agora,
        };
    });

    app.register(clientRoutes);

    return app;
}