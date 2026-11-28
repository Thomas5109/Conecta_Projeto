-- Criação dos ENUMs para padronização dos relacionamentos e status (3NF)
CREATE TYPE parentesco_enum AS ENUM ('CONJUGE', 'FILHO_A', 'IRMAO_A', 'PAI_MAE', 'AMIGO_A', 'CUIDADOR_A', 'OUTRO');
CREATE TYPE status_contato_enum AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');

-- ============================================================================
-- TABELA DE CONTATO DE EMERGÊNCIA (Sincronizada via WatermelonDB)
-- ============================================================================
CREATE TABLE contato_de_emergencia (
    -- Ajustado para VARCHAR(255) com DEFAULT UUID para suportar criação no backend ou WatermelonDB
    id_contato_emergencia VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Chave estrangeira ligando ao cliente, também em VARCHAR(255)
    id_cliente VARCHAR(255) NOT NULL,
    
    -- Dados de identificação e contato
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(25) NOT NULL,
    parentesco parentesco_enum NOT NULL,
    status status_contato_enum NOT NULL DEFAULT 'ATIVO',
    
    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraint de Foreign Key nomeada para facilitar manutenção
    CONSTRAINT fk_contato_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES usuario_cliente(id_cliente)
        ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES DE ALTA PERFORMANCE
-- ============================================================================

-- Acelera o carregamento da lista de contatos de um cliente específico (Read Model)
CREATE INDEX idx_contato_emergencia_cliente ON contato_de_emergencia(id_cliente);

-- Acelera a busca de contatos modificados para a sincronização (Pull do WatermelonDB)
CREATE INDEX idx_contato_emergencia_sync ON contato_de_emergencia(id_cliente, updated_at);