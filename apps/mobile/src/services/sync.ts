import { synchronize } from '@nozbe/watermelondb/sync';
import database from '../database/database'; // A instância do seu WatermelonDB local

// Permite sobrescrever via .env do Expo (EXPO_PUBLIC_API_URL) ou usa o IP da sua rede local
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.100.6:3000';

export async function syncData() {
  await synchronize({
    database,
    // 1. PULL: Baixa as alterações do servidor (Fastify -> App)
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      // O lastPulledAt vem nulo na primeira vez, ou com o timestamp da última sincronia
      const urlParams = lastPulledAt ? `?last_pulled_at=${lastPulledAt}` : '';
      
      const response = await fetch(`${API_URL}/sync${urlParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${seuTokenJWT}` // Incorpore quando a auth estiver pronta
        },
      });

      if (!response.ok) {
        const erroTexto = await response.text();
        throw new Error(`Erro no PULL (${response.status}): ${erroTexto}`);
      }

      const { changes, timestamp } = await response.json();
      
      return { changes, timestamp };
    },

    // 2. PUSH: Envia as alterações locais (App -> Fastify)
    pushChanges: async ({ changes, lastPulledAt }) => {
      const response = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${seuTokenJWT}`
        },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        const erroTexto = await response.text();
        throw new Error(`Erro no PUSH (${response.status}): ${erroTexto}`);
      }
    },
    
    // Configurações recomendadas para offline-first
    migrationsEnabledAtVersion: 1,
  });
}