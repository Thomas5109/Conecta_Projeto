import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Cria um pool de conexões padrão do PostgreSQL
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Envolve o pool de conexões no adaptador do Prisma
const adapter = new PrismaPg(pool);

// 3. Injeta o adaptador no Prisma Client
const prisma = new PrismaClient({ adapter });

export default prisma;