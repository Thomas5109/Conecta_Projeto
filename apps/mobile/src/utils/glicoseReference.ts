import type {
    ContextoGlicose,
    PerfilReferenciaGlicose,
    ResultadoReferenciaGlicose,
} from '../types/glicose.types';

export const PERFIS_REFERENCIA_GLICOSE: {
    valor: PerfilReferenciaGlicose;
    rotulo: string;
}[] = [
    { valor: 'ADULTO_SEM_DIABETES', rotulo: 'Adulto sem diabetes' },
    { valor: 'ADULTO_COM_DIABETES', rotulo: 'Adulto com diabetes · metas SBD' },
    { valor: 'GESTACIONAL', rotulo: 'Gestante com diabetes gestacional' },
];

export const CONTEXTOS_GLICOSE: {
    valor: ContextoGlicose;
    rotulo: string;
}[] = [
    { valor: 'JEJUM', rotulo: 'Em jejum (8 a 12 horas)' },
    { valor: 'ANTES_REFEICAO', rotulo: 'Antes da refeição' },
    { valor: 'UMA_HORA_APOS_REFEICAO', rotulo: '1 hora após refeição' },
    { valor: 'DUAS_HORAS_APOS_REFEICAO', rotulo: '2 horas após refeição' },
    { valor: 'ANTES_DORMIR', rotulo: 'Ao deitar' },
    { valor: 'OUTRO', rotulo: 'Outro momento' },
];

interface FaixaGlicose {
    minimo: number;
    maximo?: number;
    maximoInclusivo: boolean;
    rotulo: string;
}

const faixas: Record<
    PerfilReferenciaGlicose,
    Partial<Record<ContextoGlicose, FaixaGlicose>>
> = {
    ADULTO_SEM_DIABETES: {
        JEJUM: { minimo: 70, maximo: 99, maximoInclusivo: true, rotulo: '70 a 99 mg/dL' },
        ANTES_REFEICAO: { minimo: 70, maximo: 99, maximoInclusivo: true, rotulo: '70 a 99 mg/dL' },
        UMA_HORA_APOS_REFEICAO: { minimo: 70, maximo: 140, maximoInclusivo: false, rotulo: '70 a <140 mg/dL' },
        DUAS_HORAS_APOS_REFEICAO: { minimo: 70, maximo: 140, maximoInclusivo: false, rotulo: '70 a <140 mg/dL' },
    },
    ADULTO_COM_DIABETES: {
        JEJUM: { minimo: 80, maximo: 130, maximoInclusivo: true, rotulo: '80 a 130 mg/dL' },
        ANTES_REFEICAO: { minimo: 80, maximo: 130, maximoInclusivo: true, rotulo: '80 a 130 mg/dL' },
        UMA_HORA_APOS_REFEICAO: { minimo: 70, maximo: 180, maximoInclusivo: false, rotulo: '70 a <180 mg/dL' },
        DUAS_HORAS_APOS_REFEICAO: { minimo: 70, maximo: 180, maximoInclusivo: false, rotulo: '70 a <180 mg/dL' },
        ANTES_DORMIR: { minimo: 90, maximo: 150, maximoInclusivo: true, rotulo: '90 a 150 mg/dL' },
    },
    GESTACIONAL: {
        JEJUM: { minimo: 70, maximo: 95, maximoInclusivo: false, rotulo: '70 a <95 mg/dL' },
        ANTES_REFEICAO: { minimo: 70, maximo: 95, maximoInclusivo: false, rotulo: '70 a <95 mg/dL' },
        UMA_HORA_APOS_REFEICAO: { minimo: 70, maximo: 140, maximoInclusivo: false, rotulo: '70 a <140 mg/dL' },
        DUAS_HORAS_APOS_REFEICAO: { minimo: 70, maximo: 120, maximoInclusivo: false, rotulo: '70 a <120 mg/dL' },
    },
};

export function classificarGlicose(
    valor: number,
    perfil: PerfilReferenciaGlicose,
    contexto: ContextoGlicose,
): ResultadoReferenciaGlicose {
    const faixa = faixas[perfil][contexto];
    if (!faixa) {
        return {
            status: 'SEM_FAIXA',
            rotulo: 'Sem faixa de referência',
            faixa: 'Não há uma faixa cadastrada para esse perfil e contexto.',
        };
    }

    const acima = faixa.maximo !== undefined &&
        (faixa.maximoInclusivo ? valor > faixa.maximo : valor >= faixa.maximo);
    if (valor < faixa.minimo) {
        return { status: 'ABAIXO_DA_META', rotulo: 'Abaixo da meta', faixa: faixa.rotulo };
    }
    if (acima) {
        return { status: 'ACIMA_DA_META', rotulo: 'Acima da meta', faixa: faixa.rotulo };
    }
    return { status: 'DENTRO_DA_META', rotulo: 'Dentro da meta', faixa: faixa.rotulo };
}

export function isPerfilReferenciaGlicose(
    valor: unknown,
): valor is PerfilReferenciaGlicose {
    return valor === 'ADULTO_SEM_DIABETES' ||
        valor === 'ADULTO_COM_DIABETES' ||
        valor === 'GESTACIONAL';
}
