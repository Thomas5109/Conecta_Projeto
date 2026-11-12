import type {
    ContextoGlicose,
    PerfilReferenciaGlicose,
    ResultadoReferenciaGlicose,
} from '../../types/glicose.types';

export interface DadosGlicose {
    valorMgDl: number;
    idPaciente: string;
    dataHora: Date;
    contexto: ContextoGlicose;
    perfilReferencia: PerfilReferenciaGlicose;
    classificacao: ResultadoReferenciaGlicose;
}

export interface DadosPressao {
    sistolica: number;
    diastolica: number;
    idPaciente: string;
    dataHora: Date;
}

export function construirFhirGlicose(dados: DadosGlicose): object {
    return {
        resourceType: 'Observation',
        status: 'final',
        category: [
            {
                coding: [
                    {
                        system: 'http://hl7.org',
                        code: 'laboratory',
                        display: 'Laboratory',
                    },
                ],
            },
        ],
        code: {
            coding: [
                {
                    system: 'http://loinc.org',
                    code: '41653-7',
                    display: 'Glucose [Mass/volume] in Capillary blood by Glucometer',
                },
            ],
            text: 'Glicose Capilar',
        },
        subject: {
            reference: 'Patient/' + dados.idPaciente,
        },
        effectiveDateTime: dados.dataHora.toISOString(),
        extension: [
            {
                url: 'http://seu-app.com/fhir/contexto-medicao',
                valueString: dados.contexto,
            },
            {
                url: 'http://seu-app.com/fhir/perfil-referencia-glicose',
                valueString: dados.perfilReferencia,
            },
            {
                url: 'http://seu-app.com/fhir/classificacao-referencia-glicose',
                valueString: dados.classificacao.status,
            },
            {
                url: 'http://seu-app.com/fhir/faixa-referencia-glicose',
                valueString: dados.classificacao.faixa,
            },
        ],
        ...(dados.classificacao.status === 'SEM_FAIXA'
            ? {}
            : {
                  referenceRange: [{ text: dados.classificacao.faixa }],
                  interpretation: [
                      {
                          coding: [
                              {
                                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                                  code:
                                      dados.classificacao.status === 'DENTRO_DA_META'
                                          ? 'N'
                                          : dados.classificacao.status === 'ABAIXO_DA_META'
                                            ? 'L'
                                            : 'H',
                                  display: dados.classificacao.rotulo,
                              },
                          ],
                      },
                  ],
              }),
        valueQuantity: {
            value: dados.valorMgDl,
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL',
        },
    };
}

export function construirFhirPressao(dados: DadosPressao): object {
    return {
        resourceType: 'Observation',
        status: 'final',
        category: [
            {
                coding: [
                    {
                        system: 'http://hl7.org',
                        code: 'vital-signs',
                        display: 'Vital Signs',
                    },
                ],
            },
        ],
        code: {
            coding: [
                {
                    system: 'http://loinc.org',
                    code: '85354-9',
                    display: 'Blood pressure panel with all daily measurements',
                },
            ],
        },
        subject: {
            reference: 'Patient/' + dados.idPaciente,
        },
        effectiveDateTime: dados.dataHora.toISOString(),
        component: [
            {
                code: {
                    coding: [
                        {
                            system: 'http://loinc.org',
                            code: '8480-6',
                            display: 'Systolic blood pressure',
                        },
                    ],
                },
                valueQuantity: {
                    value: dados.sistolica,
                    unit: 'mmHg',
                    system: 'http://unitsofmeasure.org',
                    code: 'mm[Hg]',
                },
            },
            {
                code: {
                    coding: [
                        {
                            system: 'http://loinc.org',
                            code: '8462-4',
                            display: 'Diastolic blood pressure',
                        },
                    ],
                },
                valueQuantity: {
                    value: dados.diastolica,
                    unit: 'mmHg',
                    system: 'http://unitsofmeasure.org',
                    code: 'mm[Hg]',
                },
            },
        ],
    };
}
