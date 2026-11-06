-- O SQLite não tem ENUM nativo. Usamos TEXT com validação CHECK.
CREATE TABLE tipo_medicao (
    id_tipo_medicao TEXT PRIMARY KEY, -- Receberá o UUID gerado pelo backend
    nome_medicao TEXT UNIQUE NOT NULL,
    unidade_de_medida TEXT NOT NULL,
    codigo_loinc TEXT NOT NULL,
    
    CONSTRAINT chk_unidade CHECK (unidade_de_medida IN ('mg/dL', 'mm[Hg]')),
    CONSTRAINT chk_loinc CHECK (codigo_loinc IN ('41653-7', '85354-9'))
);

CREATE TABLE evento_medicao (
    id_evento_medicao TEXT PRIMARY KEY, -- Deve ser um UUID (gerado localmente no JS)
    id_cliente TEXT NOT NULL,
    id_tipo_medicao TEXT NOT NULL,
    
    -- O SQLite lida melhor com datas no formato ISO8601 (String) ou Epoch (Milisegundos)
    data_hora_do_evento TEXT NOT NULL, 

    -- JSON é salvo como String (TEXT). 
    fhir_observation_payload TEXT NOT NULL,
    
    -- Campos exclusivos do celualar para o Padrão Outbox (Não vão para o Postgres)
    is_critico INTEGER NOT NULL DEFAULT 0, -- 0 = Falso, 1 = Verdadeiro
    status_sincronizacao TEXT NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'ENVIADO'
    
    -- Validação de JSON no SQLite utilizando a extensão json1 nativa
    CONSTRAINT chk_fhir_resource_type 
        CHECK (json_extract(fhir_observation_payload, '$.resourceType') = 'Observation'),
        
    CONSTRAINT chk_fhir_status 
        CHECK (json_extract(fhir_observation_payload, '$.status') 
        IN ('registered', 'preliminary', 'final', 'amended')),

    FOREIGN KEY (id_tipo_medicao) REFERENCES tipo_medicao(id_tipo_medicao)
);

-- Índices no celular para acelerar a busca de itens que precisam ir para o servidor
CREATE INDEX idx_sincronizacao_pendente 
    ON evento_medicao(status_sincronizacao) 
    WHERE status_sincronizacao = 'PENDENTE';