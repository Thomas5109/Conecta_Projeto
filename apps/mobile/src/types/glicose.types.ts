export type ContextoGlicose =
    | 'JEJUM'
    | 'ANTES_REFEICAO'
    | 'UMA_HORA_APOS_REFEICAO'
    | 'DUAS_HORAS_APOS_REFEICAO'
    | 'ANTES_DORMIR'
    | 'OUTRO';

export type PerfilReferenciaGlicose =
    | 'ADULTO_SEM_DIABETES'
    | 'ADULTO_COM_DIABETES'
    | 'GESTACIONAL';

export type StatusReferenciaGlicose =
    | 'DENTRO_DA_META'
    | 'ABAIXO_DA_META'
    | 'ACIMA_DA_META'
    | 'SEM_FAIXA';

export interface ResultadoReferenciaGlicose {
    status: StatusReferenciaGlicose;
    rotulo: string;
    faixa: string;
}
