import { useState } from 'react';
import { fazerLogin } from '../services/api/authApi';
import { salvarUsuario } from '../services/storage/localData';

export function useLogin() {
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function handleLogin(): Promise<boolean> {
        setErro('');
        const valor = identificador.trim();
        const emailInformado = valor.includes('@');
        const cpfInformado = /^[\d.\-\s]+$/.test(valor) && valor.replace(/\D/g, '').length === 11;
        if (!senha || (!emailInformado && !cpfInformado)) {
            setErro('Informe um CPF válido ou e-mail e preencha a senha.');
            return false;
        }

        setCarregando(true);
        try {
            const resposta = await fazerLogin(valor, senha);
            await salvarUsuario({
                idUsuario: resposta.usuario.idUsuario,
                idCliente: resposta.usuario.cliente?.idCliente ?? null,
                nome: resposta.usuario.cliente?.nome ?? '',
                email: resposta.usuario.email,
                tipoUsuario: resposta.usuario.tipoUsuario,
            });
            return true;
        } catch (error) {
            setErro(error instanceof Error ? error.message : 'Ocorreu um erro inesperado.');
            return false;
        } finally {
            setCarregando(false);
        }
    }

    return {
        identificador,
        setIdentificador,
        senha,
        setSenha,
        carregando,
        erro,
        handleLogin,
    };
}
