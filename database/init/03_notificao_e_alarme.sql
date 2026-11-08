-- Criação dos ENUMs para garantir integridade e padronização (3NF)
CREATE TYPE frequencia_dias_enum AS ENUM ('DIARIAMENTE', 'DIAS_UTEIS', 'FINS_DE_SEMANA', 'PERSONALIZADO');
CREATE TYPE canal_comunicacao_enum AS ENUM ('WHATSAPP', 'SMS', 'PUSH', 'LIGACAO');
CREATE TYPE status_envio_enum AS ENUM ('PENDENTE', 'PROCESSANDO', 'ENVIADO', 'FALHA', 'ENTREGUE');

-- 1. Tabela de Lembretes (Espelho para o Agendamento Local)
CREATE TABLE lembrete_medicao (
    -- Ajustado para VARCHAR(255) para suportar IDs gerados pelo WatermelonDB (ex: a1b2c3d4e5f6g7h8)
    id_lembrete VARCHAR(255) PRIMARY KEY,
    
    -- Ajustado para VARCHAR(255) para manter consistência com as tabelas referenciadas
    id_cliente VARCHAR(255) NOT NULL REFERENCES usuario_cliente(id_cliente) ON DELETE CASCADE,
    id_tipo_medicao VARCHAR(255) NOT NULL REFERENCES tipo_medicao(id_tipo_medicao) ON DELETE RESTRICT,
    
    -- Dados consumidos pelo React Native para programar o alarme nativo
    horario_programado TIME NOT NULL, 
    fuso_horario VARCHAR(50) NOT NULL DEFAULT 'America/Campo_Grande',
    notificacao_ativa BOOLEAN NOT NULL DEFAULT TRUE,
    frequencia_dias frequencia_dias_enum NOT NULL,
    
    -- Estrutura fundamental para Sincronização Offline-first (WatermelonDB)
    versao INTEGER NOT NULL DEFAULT 1,
    
    -- Nomenclatura ajustada para o padrão do WatermelonDB e adição do deleted_at
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Trigger para atualizar o timestamp e versão (útil para o pull do offline-first e concorrência)
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

-- 2. Tabela de Alarmes (Acionada ativamente pelo Backend/Workers)
CREATE TABLE mensagem_alarmante (
    -- Esta tabela provavelmente NÃO será sincronizada com o WatermelonDB (é uso interno do backend),
    -- mas usando VARCHAR(255) mantém a padronização do banco.
    id_alarme VARCHAR(255) PRIMARY KEY,
    
    -- Assumindo que contato_de_emergencia (ainda não definido nas mensagens anteriores) também usará VARCHAR(255)
    id_contato_emergencia VARCHAR(255) NOT NULL REFERENCES contato_de_emergencia(id_contato_emergencia) ON DELETE CASCADE,
    
    -- Corrigida a referência: em 02_medicao_schema.sql o nome da coluna é id_evento_medicao, não id_evento
    id_evento_medicao VARCHAR(255) NOT NULL REFERENCES evento_medicao(id_evento_medicao) ON DELETE CASCADE,
    
    -- Dados da emergência gerados a partir da avaliação do payload FHIR
    texto_da_notificacao VARCHAR(500) NOT NULL,
    canal_de_comunicacao canal_comunicacao_enum NOT NULL,
    status_de_envio status_envio_enum NOT NULL DEFAULT 'PENDENTE',
    
    -- Rastreabilidade de tempo crítico
    data_e_hora_do_envio TIMESTAMP WITH TIME ZONE,
    data_e_hora_do_recebimento TIMESTAMP WITH TIME ZONE,
    
    -- Se esta tabela for sincronizada para o app exibir histórico, adicione updated_at e deleted_at também.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices essenciais para escalabilidade
-- Acelera a busca de lembretes que precisam ser sincronizados com o app após uma data específica
CREATE INDEX idx_lembrete_sincronizacao ON lembrete_medicao(id_cliente, updated_at);

-- Acelera o trabalho dos workers que buscam mensagens pendentes de envio na fila
CREATE INDEX idx_alarme_pendente ON mensagem_alarmante(status_de_envio) WHERE status_de_envio = 'PENDENTE';