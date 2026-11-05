import { useState } from 'react';
import { criarCliente } from '../services/api/clientApi';
import type { SexoCliente } from '../types/client.types';
import { dataBrasileiraParaISO, parseDataBrasileira } from '../utils/dateTime';

function formatarNumeroTelefone(valor: string): string {
    const digitos = valor.replace(/\D/g, '').slice(0, 9);

    if (digitos.startsWith('9')) {
        if (digitos.length <= 1) return digitos;
        if (digitos.length <= 5) return digitos.slice(0, 1) + ' ' + digitos.slice(1);
        return digitos.slice(0, 1) + ' ' + digitos.slice(1, 5) + '-' + digitos.slice(5);
    }

    return digitos.length <= 4
        ? digitos
        : digitos.slice(0, 4) + '-' + digitos.slice(4);
}

export function useCadastro() {
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [nome, setNome] = useState('');
    const [ddd, setDdd] = useState('');
    const [numeroTelefone, setNumeroTelefone] = useState('');
    const [dataDeNascimento, setDataDeNascimento] = useState('');
    const [sexo, setSexo] = useState<SexoCliente | ''>('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    function alterarDdd(valor: string) {
        setDdd(valor.replace(/\D/g, '').slice(0, 2));
    }

    function alterarNumeroTelefone(valor: string) {
        setNumeroTelefone(formatarNumeroTelefone(valor));
    }

    async function handleCadastro(): Promise<boolean> {
        setErro('');

        const cpfNormalizado = cpf.replace(/\D/g, '');
        const dddNormalizado = ddd.replace(/\D/g, '');
        const numeroNormalizado = numeroTelefone.replace(/\D/g, '');

        if (
            !cpfNormalizado ||
            !email.trim() ||
            !senha ||
            !nome.trim() ||
            !dataDeNascimento ||
            !sexo
        ) {
            setErro('Preencha todos os campos para criar a conta.');
            return false;
        }

        if (cpfNormalizado.length !== 11) {
            setErro('Informe um CPF com 11 números.');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErro('Informe um e-mail válido.');
            return false;
        }

        if (dddNormalizado.length !== 2) {
            setErro('Informe o DDD com 2 números.');
            return false;
        }

        if (numeroNormalizado.length !== 8 && numeroNormalizado.length !== 9) {
            setErro('Informe o número do telefone sem o DDD.');
            return false;
        }

        const dataNascimento = parseDataBrasileira(dataDeNascimento);
        const dataISO = dataBrasileiraParaISO(dataDeNascimento);
        if (!dataNascimento || !dataISO) {
            setErro('Informe uma data válida no formato DD/MM/AAAA.');
            return false;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        if (dataNascimento > hoje) {
            setErro('A data de nascimento não pode estar no futuro.');
            return false;
        }

        setCarregando(true);

        try {
            await criarCliente({
                cpf: cpfNormalizado,
                email: email.trim().toLowerCase(),
                senha,
                nome: nome.trim(),
                telefone: '(' + dddNormalizado + ') ' + numeroTelefone.trim(),
                data_de_nascimento: dataISO,
                sexo,
            });
            return true;
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível concluir o cadastro.'
            );
            return false;
        } finally {
            setCarregando(false);
        }
    }

    return {
        cpf,
        setCpf,
        email,
        setEmail,
        senha,
        setSenha,
        nome,
        setNome,
        ddd,
        setDdd: alterarDdd,
        numeroTelefone,
        setNumeroTelefone: alterarNumeroTelefone,
        dataDeNascimento,
        setDataDeNascimento,
        sexo,
        setSexo,
        carregando,
        erro,
        handleCadastro,
    };
}

