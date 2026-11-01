import { useState } from 'react';
import { fazerLogin } from '../services/api/authApi';
import { salvarUsuario } from '../services/storage/localData';

export function useLogin() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    async function handleLogin(): Promise<boolean> {
        setErro('');

        const emailDigitado = email.trim().toLowerCase();
        if (!emailDigitado || !senha) {
            setErro('Preencha o e-mail e a senha.');
            return false;
        }

        setCarregando(true);

        try {
            const resposta = await fazerLogin(emailDigitado, senha);
            await salvarUsuario({
                idUsuario: resposta.usuario.idUsuario,
                idCliente: resposta.usuario.cliente?.idCliente ?? null,
                nome: resposta.usuario.cliente?.nome ?? '',
                email: resposta.usuario.email,
                tipoUsuario: resposta.usuario.tipoUsuario,
            });
            return true;
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : 'Ocorreu um erro inesperado.'
            );
            return false;
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
