import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import PerfilReferenciaCard from '../components/PerfilReferenciaCard';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import { salvarMedicaoGlicose } from '../database/helpers/measurementRepository';
import {
    CONTEXTOS_GLICOSE,
    classificarGlicose,
} from '../utils/glicoseReference';
import type {
    ContextoGlicose,
    PerfilReferenciaGlicose,
    ResultadoReferenciaGlicose,
} from '../types/glicose.types';
import {
    lerPerfilReferenciaGlicose,
    lerUsuario,
} from '../services/storage/localData';

export default function GlicoseScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [valor, setValor] = useState('');
    const [contexto, setContexto] = useState<ContextoGlicose | null>(null);
    const [perfil, setPerfil] = useState<PerfilReferenciaGlicose | null>(null);
    const [perfilCarregado, setPerfilCarregado] = useState(false);
    const [idCliente, setIdCliente] = useState('local');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    useFocusEffect(useCallback(() => {
        let ativo = true;
        void Promise.all([lerPerfilReferenciaGlicose(), lerUsuario()])
            .then(([perfilSalvo, usuario]) => {
                if (!ativo) return;
                setPerfil(perfilSalvo);
                if (usuario?.idCliente != null) setIdCliente(String(usuario.idCliente));
            })
            .catch(() => {
                if (ativo) setErro('Não foi possível carregar as preferências de glicose.');
            })
            .finally(() => {
                if (ativo) setPerfilCarregado(true);
            });
        return () => {
            ativo = false;
        };
    }, []));

    const numeroAtual = valor.trim() ? Number(valor.replace(',', '.')) : NaN;
    const resultadoAtual =
        Number.isFinite(numeroAtual) && numeroAtual > 0 && perfil && contexto
            ? classificarGlicose(numeroAtual, perfil, contexto)
            : null;

    async function registrar(
        numero: number,
        contextoSelecionado: ContextoGlicose,
        perfilSelecionado: PerfilReferenciaGlicose,
        resultado: ResultadoReferenciaGlicose,
    ) {
        setCarregando(true);
        try {
            await salvarMedicaoGlicose(
                numero,
                idCliente,
                contextoSelecionado,
                perfilSelecionado,
                resultado,
            );
            setValor('');
            setContexto(null);
            Alert.alert(
                'Medição salva',
                'O registro foi guardado neste aparelho e está aguardando sincronização.',
                [{ text: 'Ver histórico', onPress: () => navigation.navigate('Historico') }, { text: 'OK' }],
            );
        } catch {
            setErro('Não foi possível salvar a medição no banco local.');
        } finally {
            setCarregando(false);
        }
    }

    function processarMedicao() {
        setErro('');
        const numero = Number(valor.replace(',', '.'));
        if (!valor.trim() || !Number.isFinite(numero) || numero <= 0) {
            setErro('Informe um valor de glicose válido.');
            return;
        }
        if (!perfil) {
            setErro('Selecione seu perfil de referência.');
            return;
        }
        if (!contexto) {
            setErro('Selecione o contexto da medição antes de salvar.');
            return;
        }

        void registrar(numero, contexto, perfil, classificarGlicose(numero, perfil, contexto));
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Registrar glicose</Text>
            <Text style={styles.subtitulo}>A medição ficará salva neste aparelho; a sincronização será indicada no histórico.</Text>

            <PerfilReferenciaCard
                perfil={perfil}
                onAlterar={() => navigation.navigate('Configuracoes')}
            />
            {!perfil && perfilCarregado && (
                <Text style={styles.erro}>Defina seu perfil em Configurações antes de registrar a glicose.</Text>
            )}

            <Text style={styles.rotulo}>Valor da glicose (mg/dL)</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Ex.: 105"
                placeholderTextColor={colors.placeholder}
                value={valor}
                onChangeText={setValor}
                keyboardType="decimal-pad"
                editable={!carregando}
                accessibilityLabel="Valor da glicose em miligramas por decilitro"
            />

            <Text style={[styles.rotulo, { marginTop: 28 }]}>Quando foi feita a medição?</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CONTEXTOS_GLICOSE.map((opcao) => {
                    const selecionado = contexto === opcao.valor;
                    return (
                        <Pressable
                            key={opcao.valor}
                            style={[
                                styles.chip,
                                { flexBasis: '47%', flexGrow: 1, minHeight: 52 },
                                selecionado && styles.chipSelecionado,
                            ]}
                            onPress={() => {
                                setContexto(opcao.valor);
                                setErro('');
                            }}
                            disabled={carregando}
                            accessibilityRole="button"
                            accessibilityState={{ selected: selecionado }}
                        >
                            <Text
                                style={[
                                    styles.textoChip,
                                    selecionado && styles.textoChipSelecionado,
                                ]}
                            >
                                {opcao.rotulo}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {resultadoAtual && (
                <View style={[styles.cartao, { marginTop: 20 }, resultadoAtual.status === 'ACIMA_DA_META' && styles.cartaoAlertaMeta]}>
                    <Text
                        style={[
                            styles.tituloCartao,
                            resultadoAtual.status === 'DENTRO_DA_META'
                                ? { color: colors.primary }
                                : resultadoAtual.status === 'SEM_FAIXA'
                                  ? { color: colors.textSecondary }
                                : { color: colors.error },
                        ]}
                    >
                        {resultadoAtual.rotulo}
                    </Text>
                    <Text style={styles.texto}>Faixa de referência: {resultadoAtual.faixa}</Text>
                </View>
            )}

            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            <Pressable
                style={[styles.botao, carregando && { opacity: 0.7 }]}
                onPress={processarMedicao}
                disabled={carregando || !perfilCarregado}
                accessibilityRole="button"
            >
                <Text style={styles.textoBotao}>{carregando ? 'Salvando…' : 'Salvar medição'}</Text>
            </Pressable>
        </MainScreenLayout>
    );
}
