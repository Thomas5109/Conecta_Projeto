CREATE TYPE tipo_de_unidade_ucum AS ENUM ('mg/dL', 'mm[Hg]')
CREATE TYPE tipo_de_codigo_loinc AS ENUM ('41653-7', '85354-9')


CREATE TABLE tipo_medicao (
    id_tipo_medicao SERIAL PRIMARY KEY,
    nome_medicao VARCHAR(30) UNIQUE NOT NULL,
    unidade_de_medida tipo_de_unidade_ucum NOT NULL,
    codigo_loinc tipo_de_codigo_loinc NOT NULL
);

CREATE TABLE evento_medicao (
    id_evento_medicao SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_tipo_medicao INTEGER NOT NULL,

    data_hora_do_evento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fhir_observation_payload JSONB NOT NULL,
    
    -- Validações básicas do JSON adicionadas direto na criação da tabela
    CONSTRAINT chk_fhir_resource_type 
        CHECK (fhir_observation_payload->>'resourceType' = 'Observation'),
        
    CONSTRAINT chk_fhir_status 
        CHECK (fhir_observation_payload->>'status' 
        IN ('registered', 'preliminary', 'final', 'amended')),

    -- Chaves Estrangeiras
    CONSTRAINT fk_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES usuario_cliente(id_cliente),

    CONSTRAINT fk_tipo_medicao
        FOREIGN KEY (id_tipo_medicao)
        REFERENCES tipo_medicao(id_tipo_medicao)  

);

-- Indexando a coluna JSONB para buscas de alta performance dentro do payload
CREATE INDEX idx_evento_medicao_fhir 
    ON evento_medicao USING GIN (fhir_observation_payload);

