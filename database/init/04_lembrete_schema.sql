-- Criação dos ENUMs para garantir integridade e padronização (3NF)
CREATE TYPE frequencia_dias_enum AS ENUM ('DIARIAMENTE', 'DIAS_UTEIS', 'FINS_DE_SEMANA', 'PERSONALIZADO');

-- ============================================================================
-- 1. TABELA DE LEMBRETES (Sincronizada via WatermelonDB)
-- ============================================================================
CREATE TABLE lembrete_medicao (
    id_lembrete VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    id_cliente VARCHAR(255) NOT NULL REFERENCES usuario_cliente(id_cliente) ON DELETE CASCADE,
    id_tipo_medicao VARCHAR(255) NOT NULL REFERENCES tipo_medicao(id_tipo_medicao) ON DELETE RESTRICT,
    
    horario_programado TIME NOT NULL, 
    fuso_horario VARCHAR(50) NOT NULL DEFAULT 'America/Campo_Grande',
    notificacao_ativa BOOLEAN NOT NULL DEFAULT TRUE,
    frequencia_dias frequencia_dias_enum NOT NULL,
    
    versao INTEGER NOT NULL DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE OR REPLACE FUNCTION atualiza_timestamp_lembrete()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   NEW.versao = OLD.versao + 1;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualiza_lembrete
BEFORE UPDATE ON lembrete_medicao
FOR EACH ROW EXECUTE PROCEDURE atualiza_timestamp_lembrete();


-- ============================================================================
-- ÍNDICES DE ALTA PERFORMANCE (CQRS & Workers)
-- ============================================================================

-- Acelera a busca de lembretes modificados para sincronização (Pull)
CREATE INDEX idx_lembrete_sincronizacao ON lembrete_medicao(id_cliente, updated_at);