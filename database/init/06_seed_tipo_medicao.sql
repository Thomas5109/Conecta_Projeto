INSERT INTO tipo_medicao (
    id_tipo_medicao,
    nome_medicao,
    unidade_de_medida,
    codigo_loinc
)
VALUES
    ('1', 'Glicose', 'mg/dL', '41653-7'),
    ('2', 'Pressão Arterial', 'mm[Hg]', '85354-9')
ON CONFLICT (id_tipo_medicao) DO NOTHING;