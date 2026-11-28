import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useLogin } from '../hooks/useLogin';
import { colors } from '../theme/colors';
import { loginStyles as styles } from '../theme/loginStyles';

export default function LoginScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { identificador, setIdentificador, senha, setSenha, carregando, erro, handleLogin } = useLogin();

    async function entrar() {
        if (await handleLogin()) {
            navigation.reset({ index: 0, routes: [{ name: 'Inicio' }] });
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.cabecalho}>
                        <Text style={styles.titulo}>Bem-vindo!</Text>
                        <Text style={styles.subtitulo}>
                            Entre na sua conta para continuar.
                        </Text>
                    </View>
    
                    <View style={styles.formulario}>
                        <Text style={styles.label}>CPF ou e-mail</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite seu CPF ou e-mail"
                            placeholderTextColor={colors.placeholder}
                            value={identificador}
                            onChangeText={setIdentificador}
                            keyboardType="default"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="username"
                            accessibilityLabel="CPF ou e-mail"
                            editable={!carregando}
                            returnKeyType="next"
                        />
    
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite sua senha"
                            placeholderTextColor={colors.placeholder}
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="current-password"
                            accessibilityLabel="Senha"
                            editable={!carregando}
                            returnKeyType="done"
                            onSubmitEditing={() => void entrar()}
                        />
    
                        {erro !== '' && (
                            <Text style={styles.erro} accessibilityRole="alert">
                                {erro}
                            </Text>
                        )}
    
                        <Pressable
                            style={[styles.botao, carregando && styles.botaoDesativado]}
                            onPress={() => void entrar()}
                            disabled={carregando}
                            accessibilityRole="button"
                            accessibilityLabel="Entrar na conta"
                        >
                            {carregando ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.textoBotao}>Entrar</Text>
                            )}
                        </Pressable>
    
                        <Pressable
                            style={styles.botaoCadastro}
                            onPress={() => navigation.navigate('Cadastro')}
                            disabled={carregando}
                            accessibilityRole="button"
                            accessibilityLabel="Criar uma nova conta"
                        >
                            <Text style={styles.textoBotaoCadastro}>Criar conta</Text>
                        </Pressable>
    
                        <Text style={styles.ajuda}>
                            Use seu CPF ou e-mail e a senha informados no cadastro.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

