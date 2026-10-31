import { useState } from 'react';
import { Alert } from 'react-native';

import { fazerLogin } from '../services/api/authApi';

export function useLogin() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function handleLogin() {
        setErro('');

        const emailDigitado = email.trim().toLowerCase();

        if (!emailDigitado || !senha) {
            setErro('Preencha o e-mail e a senha.');
            return;
        }

        setCarregando(true);

        try {
            const resultado = await fazerLogin(
                emailDigitado,
                senha
            );

            Alert.alert(
                'Credenciais verificadas',
                `${resultado.mensagem}\n\nOlá, ${
                    resultado.usuario.cliente?.nome ??
                    resultado.usuario.email
                }!`
            );
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Ocorreu um erro inesperado.'
            );
        } finally {
            setCarregando(false);
        }
    }

    return {
        email,
        setEmail,
        senha,
        setSenha,
        carregando,
        erro,
        handleLogin,
    };
}