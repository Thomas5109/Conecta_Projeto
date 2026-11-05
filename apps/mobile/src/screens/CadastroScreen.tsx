import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useCadastro } from '../hooks/useCadastro';
import { cadastroStyles as styles } from '../theme/cadastroStyles';
import { colors } from '../theme/colors';
import CampoDataHora from '../components/CampoDataHora';
import type { SexoCliente } from '../types/client.types';

const opcoesSexo: { valor: SexoCliente; rotulo: string }[] = [
    { valor: 'FEMININO', rotulo: 'Feminino' },
    { valor: 'MASCULINO', rotulo: 'Masculino' },
    { valor: 'OUTRO', rotulo: 'Outro' },
];

export default function CadastroScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const {
        cpf,
        setCpf,
        email,
        setEmail,
        senha,
        setSenha,
        nome,
        setNome,
        ddd,
        setDdd,
        numeroTelefone,
        setNumeroTelefone,
        dataDeNascimento,
        setDataDeNascimento,
        sexo,
        setSexo,
        carregando,
        erro,
        handleCadastro,
    } = useCadastro();

    async function concluirCadastro() {
        if (await handleCadastro()) {
            Alert.alert(
                'Cadastro concluído',
                'Sua conta foi criada. Entre com seu e-mail e senha.'
            );
            navigation.goBack();
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: colors.background }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.cabecalho}>
                        <Text style={styles.titulo}>Criar conta</Text>
                        <Text style={styles.subtitulo}>
                            Preencha seus dados para se cadastrar.
                        </Text>
                    </View>

                    <Text style={styles.label}>Nome completo</Text>
                    <TextInput
                        style={styles.input}
                        value={nome}
                        onChangeText={setNome}
                        autoCapitalize="words"
                        editable={!carregando}
                        accessibilityLabel="Nome completo"
                    />

                    <Text style={styles.label}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="11 números"
                        placeholderTextColor={colors.placeholder}
                        value={cpf}
                        onChangeText={setCpf}
                        keyboardType="numeric"
                        editable={!carregando}
                        accessibilityLabel="CPF"
                    />

                    <Text style={styles.label}>E-mail</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!carregando}
                        accessibilityLabel="E-mail"
                    />

                    <Text style={styles.label}>Senha</Text>
                    <TextInput
                        style={styles.input}
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                        autoCapitalize="none"
                        editable={!carregando}
                        accessibilityLabel="Senha"
                    />

                    <Text style={styles.label}>Telefone para contato</Text>
                    <View style={styles.telefoneLinha}>
                        <View style={styles.telefoneDdd}>
                            <Text style={styles.telefoneSubLabel}>DDD</Text>
                            <TextInput
                                style={[styles.input, styles.telefoneInput]}
                                placeholder="65"
                                placeholderTextColor={colors.placeholder}
                                value={ddd}
                                onChangeText={setDdd}
                                keyboardType="number-pad"
                                maxLength={2}
                                editable={!carregando}
                                accessibilityLabel="DDD do telefone"
                                accessibilityHint="Digite os dois números do DDD"
                            />
                        </View>
                        <View style={styles.telefoneNumero}>
                            <Text style={styles.telefoneSubLabel}>Número do telefone</Text>
                            <TextInput
                                style={[styles.input, styles.telefoneInput]}
                                placeholder="9 1234-5678"
                                placeholderTextColor={colors.placeholder}
                                value={numeroTelefone}
                                onChangeText={setNumeroTelefone}
                                keyboardType="phone-pad"
                                maxLength={12}
                                editable={!carregando}
                                accessibilityLabel="Número do telefone sem o DDD"
                                accessibilityHint="Digite o número sem incluir o DDD"
                            />
                        </View>
                    </View>
                    <Text style={styles.ajudaTelefone}>
                        Exemplo: DDD 65 e número 9 1234-5678.
                    </Text>

                    <Text style={styles.label}>Data de nascimento</Text>
                    <CampoDataHora
                        mode="date"
                        value={dataDeNascimento}
                        onChangeText={setDataDeNascimento}
                        inputStyle={styles.input}
                        placeholder="DD/MM/AAAA"
                        maximumDate={new Date()}
                        disabled={carregando}
                        accessibilityLabel="Data de nascimento"
                    />

                    <Text style={styles.label}>Sexo</Text>
                    <View style={styles.opcoesSexo}>
                        {opcoesSexo.map((opcao) => (
                            <Pressable
                                key={opcao.valor}
                                style={[
                                    styles.opcaoSexo,
                                    sexo === opcao.valor && styles.opcaoSexoSelecionada,
                                ]}
                                onPress={() => setSexo(opcao.valor)}
                                disabled={carregando}
                                accessibilityRole="button"
                                accessibilityState={{ selected: sexo === opcao.valor }}
                            >
                                <Text
                                    style={[
                                        styles.textoOpcaoSexo,
                                        sexo === opcao.valor && styles.textoOpcaoSexoSelecionada,
                                    ]}
                                >
                                    {opcao.rotulo}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {erro !== '' && (
                        <Text style={styles.erro} accessibilityRole="alert">
                            {erro}
                        </Text>
                    )}


                    <Pressable
                        style={[styles.botao, carregando && styles.botaoDesativado]}
                        onPress={concluirCadastro}
                        disabled={carregando}
                        accessibilityRole="button"
                    >
                        {carregando ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.textoBotao}>Concluir cadastro</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


