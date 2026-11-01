import bcrypt from 'bcryptjs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { createClient } from './client.service.js';
import type { CreateClientBody } from './client.types.js';

type ResultadoValidacao =
    | { valido: true; dados: CreateClientBody }
    | { valido: false; erro: string };

function calcularDigitoCpf(cpf: string, quantidade: number): number {
    let soma = 0;

    for (let indice = 0; indice < quantidade; indice += 1) {
        soma += Number(cpf[indice]) * (quantidade + 1 - indice);
    }

    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
}

function validarCpf(valor: string): string | null {
    if (!/^[\d.\-\s]+$/.test(valor.trim())) return null;

    const cpf = valor.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return null;

    const primeiroDigito = calcularDigitoCpf(cpf, 9);
    const segundoDigito = calcularDigitoCpf(cpf, 10);

    if (
        Number(cpf[9]) !== primeiroDigito ||
        Number(cpf[10]) !== segundoDigito
    ) {
        return null;
    }

    return cpf;
}

function validarEmail(valor: string): boolean {
    const email = valor.trim();
    if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return false;
    }

    const separador = email.lastIndexOf('@');
    const parteLocal = email.slice(0, separador);
    const dominio = email.slice(separador + 1);
    if (
        parteLocal.length > 64 ||
        dominio.length > 253 ||
        parteLocal.startsWith('.') ||
        parteLocal.endsWith('.') ||
        parteLocal.includes('..') ||
        !/^[A-Z0-9.!#$%&'*+/_?^{}|~-]+$/i.test(parteLocal)
    ) {
        return false;
    }

    const rotulos = dominio.split('.');
    if (
        rotulos.length < 2 ||
        rotulos.some(
            (rotulo) =>
                rotulo.length > 63 ||
                !/^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/i.test(rotulo)
        )
    ) {
        return false;
    }

    return rotulos[rotulos.length - 1].length >= 2;
}

function validarTelefone(valor: string): boolean {
    const telefone = valor.trim();
    if (
        telefone.length > 25 ||
        !/^\+?[\d\s().-]+$/.test(telefone)
    ) {
        return false;
    }

    const numero = parsePhoneNumberFromString(telefone, {
        defaultCountry: 'BR',
        extract: false,
    });

    return numero?.isValid() ?? false;
}

function validarDataNascimento(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const [ano, mes, dia] = valor.split('-').map(Number);
    if (ano < 1 || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
        return false;
    }

    const dataInformada = new Date(0);
    dataInformada.setUTCFullYear(ano, mes - 1, dia);
    dataInformada.setUTCHours(0, 0, 0, 0);

    if (
        dataInformada.getUTCFullYear() !== ano ||
        dataInformada.getUTCMonth() !== mes - 1 ||
        dataInformada.getUTCDate() !== dia
    ) {
        return false;
    }

    const hoje = new Date();
    const hojeIso =
        String(hoje.getFullYear()).padStart(4, '0') +
        '-' +
        String(hoje.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(hoje.getDate()).padStart(2, '0');

    return valor <= hojeIso;
}

function validarCadastro(dados: CreateClientBody): ResultadoValidacao {
    const cpf = validarCpf(dados.cpf);
    if (!cpf) {
        return { valido: false, erro: 'Informe um CPF válido.' };
    }

    const email = dados.email.trim().toLowerCase();
    if (!validarEmail(email)) {
        return { valido: false, erro: 'Informe um e-mail válido.' };
    }

    if (dados.senha.length < 8) {
        return {
            valido: false,
            erro: 'A senha deve ter pelo menos 8 caracteres.',
        };
    }

    if (bcrypt.truncates(dados.senha)) {
        return {
            valido: false,
            erro: 'A senha não pode ultrapassar o limite de 72 bytes.',
        };
    }

    const nome = dados.nome.trim();
    if (nome.length < 2 || nome.length > 150) {
        return {
            valido: false,
            erro: 'O nome deve ter entre 2 e 150 caracteres.',
        };
    }

    const telefone = dados.telefone.trim();
    if (!validarTelefone(telefone)) {
        return {
            valido: false,
            erro: 'Informe um telefone válido com código de área.',
        };
    }

    const dataNascimento = dados.data_de_nascimento.trim();
    if (!validarDataNascimento(dataNascimento)) {
        return {
            valido: false,
            erro: 'Informe uma data válida no formato AAAA-MM-DD que não seja futura.',
        };
    }

    const sexo = dados.sexo.trim().toUpperCase();
    if (!['FEMININO', 'MASCULINO', 'OUTRO'].includes(sexo)) {
        return { valido: false, erro: 'Selecione uma opção válida para sexo.' };
    }

    return {
        valido: true,
        dados: {
            cpf,
            email,
            senha: dados.senha,
            nome,
            telefone,
            data_de_nascimento: dataNascimento,
            sexo,
        },
    };
}

// Valida e normaliza a entrada antes de delegar a criação ao service.
export async function createClientController(
    request: FastifyRequest<{ Body: CreateClientBody }>,
    reply: FastifyReply
) {
    const validacao = validarCadastro(request.body);
    if (!validacao.valido) {
        return reply.code(400).send({ erro: validacao.erro });
    }

    try {
        const cliente = await createClient(validacao.dados);

        return reply.code(201).send({
            mensagem: 'Cliente Cadastrado com sucesso!.',
            cliente,
        });
    } catch (error) {
        const databaseError = error as { code?: string };

        if (databaseError.code === '23505') {
            return reply.code(409).send({
                erro: 'CPF ou e-mail já cadastrado.',
            });
        }

        throw error;
    }
}
