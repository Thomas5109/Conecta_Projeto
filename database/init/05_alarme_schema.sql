CREATE TYPE canal_comunicacao_enum AS ENUM ('WHATSAPP', 'SMS', 'PUSH', 'LIGACAO');
CREATE TYPE status_envio_enum AS ENUM ('PENDENTE', 'PROCESSANDO', 'ENVIADO', 'FALHA', 'ENTREGUE');

-- ============================================================================
-- 2. TABELA DE ALERTA (A Intenção / Evento de Domínio)
-- Gerada offline no Android e sincronizada via WatermelonDB para o Backend
-- ============================================================================
CREATE TABLE alerta_medicao (
    -- ID alfanumérico gerado pelo WatermelonDB ou UUID padrão
    id_alerta VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Vínculo com a medição exata que disparou o alarme
    id_evento_medicao VARCHAR(255) NOT NULL REFERENCES evento_medicao(id_evento_medicao) ON DELETE CASCADE,
    
    -- O texto montado pelo app no momento da crise ("Atenção, Glicose de João está em 450 mg/dL")
    texto_da_notificacao VARCHAR(500) NOT NULL,
    
    -- Timestamp exato de quando o aplicativo detectou a anomalia clinicamente
    data_e_hora_geracao TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- ============================================================================
-- 3. TABELA DE ENVIO DE ALERTA (O Roteamento Físico)
-- Pode ser desdobrada pelo App (se ele já mapear os contatos offline) 
-- ou pelo Backend ao receber o AlertaMedicao. Preparada para sync.
-- ============================================================================
CREATE TABLE envio_alerta (
    id_envio VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    id_alerta VARCHAR(255) NOT NULL REFERENCES alerta_medicao(id_alerta) ON DELETE CASCADE,
    id_contato_emergencia VARCHAR(255) NOT NULL REFERENCES contato_de_emergencia(id_contato_emergencia) ON DELETE CASCADE,
    
    canal_de_comunicacao canal_comunicacao_enum NOT NULL,
    
    -- 'PENDENTE' garante que os workers do backend capturem este registro 
    -- assim que o WatermelonDB sincronizar com a nuvem
    status_de_envio status_envio_enum NOT NULL DEFAULT 'PENDENTE',
    
    -- Rastreabilidade preenchida pelos workers transacionais do backend
    data_e_hora_do_envio TIMESTAMP WITH TIME ZONE,
    data_e_hora_do_recebimento TIMESTAMP WITH TIME ZONE,
    
    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- Acelera a leitura de alertas pelo ID do evento
CREATE INDEX idx_alerta_evento ON alerta_medicao(id_evento_medicao);

-- Índice crítico: Acelera o Polling Assíncrono dos Workers do backend 
-- que estão buscando disparos pendentes para enviar via API (WhatsApp/SMS)
CREATE INDEX idx_envio_alerta_pendente ON envio_alerta(status_de_envio) WHERE status_de_envio = 'PENDENTE';