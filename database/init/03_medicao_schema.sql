CREATE TYPE tipo_de_unidade_ucum AS ENUM ('mg/dL', 'mm[Hg]');
CREATE TYPE tipo_de_codigo_loinc AS ENUM ('41653-7', '85354-9');

CREATE TABLE tipo_medicao (
    -- Ajustado para VARCHAR(255) com DEFAULT UUID para consistência
    id_tipo_medicao VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome_medicao VARCHAR(30) UNIQUE NOT NULL,
    unidade_de_medida tipo_de_unidade_ucum NOT NULL,
    codigo_loinc tipo_de_codigo_loinc NOT NULL,

    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE evento_medicao (
    -- Ajustado para VARCHAR(255) com DEFAULT UUID
    id_evento_medicao VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text, 
    
    -- Ajustado para VARCHAR(255) para manter a compatibilidade com a tabela usuario_cliente do arquivo 01
    id_cliente VARCHAR(255) NOT NULL, 
    
    id_tipo_medicao VARCHAR(255) NOT NULL,

    -- Gerencia a regra de negócio/clínica
    data_hora_do_evento TIMESTAMP WITH TIME ZONE NOT NULL, 

    fhir_observation_payload JSONB NOT NULL,
    
    -- Colunas de Controle de Sincronização (WatermelonDB)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_fhir_resource_type 
        CHECK (fhir_observation_payload->>'resourceType' = 'Observation'),
        
    CONSTRAINT chk_fhir_status 
        CHECK (fhir_observation_payload->>'status' 
        IN ('registered', 'preliminary', 'final', 'amended')),

    CONSTRAINT fk_tipo_medicao
        FOREIGN KEY (id_tipo_medicao) REFERENCES tipo_medicao(id_tipo_medicao),

    ADD CONSTRAINT fk_evento_cliente
        FOREIGN KEY (id_cliente) REFERENCES usuario_cliente(id_cliente)
        ON DELETE CASCADE
);

-- Indexando a coluna JSONB para buscas de alta performance dentro do payload
CREATE INDEX idx_evento_medicao_fhir 
    ON evento_medicao USING GIN (fhir_observation_payload);