import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const mySchema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'measurements', // Equivalente a evento_medicao
            columns: [
            { name: 'cliente_id', type: 'string', isIndexed: true },
            { name: 'tipo_medicao_id', type: 'string' },
            { name: 'data_hora', type: 'number' }, // WatermelonDB prefere timestamps numéricos
            { name: 'fhir_payload', type: 'string' }, // SQLite não tem JSONB, salvamos como string JSON
            { name: 'is_critico', type: 'boolean' },
            { name: 'sync_status', type: 'string' }, // 'pendente', 'sincronizado'
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
            ]
        }),

        tableSchema({
            name: 'alarms', // Equivalente a lembrete_medicao
            columns: [
                { name: 'cliente_id', type: 'string', isIndexed: true },
                { name: 'tipo_medicao_id', type: 'string' },
                { name: 'horario', type: 'string' },
                { name: 'notificacao_ativa', type: 'boolean' },
                { name: 'frequencia', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        })
    ]
})