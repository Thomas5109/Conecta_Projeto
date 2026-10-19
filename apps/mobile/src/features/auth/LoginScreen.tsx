import { useState } from 'react';

import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { fazerLogin } from '../../services/api/authApi';

export default function LoginScreen() {
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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.conteudo}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.cabecalho}>
                    <Text style={styles.titulo}>
                        Bem-vindo!
                    </Text>

                    <Text style={styles.subtitulo}>
                        Entre na sua conta para continuar.
                    </Text>
                </View>

                <View style={styles.formulario}>
                    <Text style={styles.label}>
                        E-mail
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu e-mail"
                        placeholderTextColor="#606060"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        accessibilityLabel="E-mail"
                        editable={!carregando}
                        returnKeyType="next"
                    />

                    <Text style={styles.label}>
                        Senha
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Digite sua senha"
                        placeholderTextColor="#606060"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="current-password"
                        accessibilityLabel="Senha"
                        editable={!carregando}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                    />

                    {erro !== '' && (
                        <Text
                            style={styles.erro}
                            accessibilityRole="alert"
                        >
                            {erro}
                        </Text>
                    )}

                    <Pressable
                        style={[
                            styles.botao,
                            carregando && styles.botaoDesativado,
                        ]}
                        onPress={handleLogin}
                        disabled={carregando}
                        accessibilityRole="button"
                        accessibilityLabel="Entrar na conta"
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.textoBotao}>
                                Entrar
                            </Text>
                        )}
                    </Pressable>

                    <Text style={styles.ajuda}>
                        Digite o e-mail e a senha utilizados
                        no cadastro.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F8F7',
    },

    conteudo: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },

    cabecalho: {
        marginBottom: 36,
    },

    titulo: {
        fontSize: 34,
        fontWeight: '700',
        color: '#123B35',
        marginBottom: 12,
    },

    subtitulo: {
        fontSize: 19,
        lineHeight: 28,
        color: '#303D39',
    },

    formulario: {
        width: '100%',
    },

    label: {
        fontSize: 19,
        fontWeight: '600',
        color: '#202824',
        marginBottom: 10,
        marginTop: 18,
    },

    input: {
        minHeight: 58,
        borderWidth: 1,
        borderColor: '#7B8983',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 18,
        color: '#17211D',
    },

    botao: {
        minHeight: 60,
        marginTop: 28,
        borderRadius: 12,
        backgroundColor: '#126B56',
        alignItems: 'center',
        justifyContent: 'center',
    },

    botaoDesativado: {
        opacity: 0.7,
    },

    textoBotao: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    erro: {
        marginTop: 16,
        color: '#B42318',
        fontSize: 17,
        lineHeight: 24,
    },

    ajuda: {
        marginTop: 20,
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: '#414B46',
    },
});