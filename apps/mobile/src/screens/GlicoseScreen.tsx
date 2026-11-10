import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useState } from 'react';
import { Pressable, Text, TextInput, Alert } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';

// Importa a nova função do repositório WatermelonDB
import { salvarMedicaoGlicose } from '../database/helpers/measurementRepository';

export default function GlicoseScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [valor, setValor] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    // TODO: Substituir pelo ID real do usuário logado vindo do Contexto de Autenticação
    const ID_CLIENTE_LOGADO = 'id-mock-do-usuario';

    async function registrarNoBancoOffline(numero: number) {
        setCarregando(true);
        try {
            // Salva no WatermelonDB, gera UUID, Payload FHIR e status 'PENDENTE'
            await salvarMedicaoGlicose(numero, ID_CLIENTE_LOGADO);
            
            setValor('');
            navigation.navigate('Historico');
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

        // Validação Clínica Local (Regra de Negócio Offline)
        // Valores abaixo de 70 (Hipoglicemia) ou acima de 250 (Hiperglicemia)
        const isCritico = numero < 70 || numero > 250;

        if (isCritico) {
            // Tela de Double Check (Confirmação)
            Alert.alert(
                "Atenção: Medição de Risco",
                `O valor de ${numero} mg/dL é considerado crítico. Tem certeza que digitou corretamente?`,
                [
                    { text: "Não, vou corrigir", style: "cancel" },
                    { text: "Sim, salvar", style: "destructive", onPress: () => registrarNoBancoOffline(numero) }
                ]
            );
        } else {
            // Valor normal, salva direto
            registrarNoBancoOffline(numero);
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Registrar glicose</Text>
            <Text style={styles.subtitulo}>A medição ficará salva neste aparelho.</Text>

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

            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            <Pressable
                style={[styles.botao, carregando && { opacity: 0.7 }]}
                onPress={processarMedicao}
                disabled={carregando}
                accessibilityRole="button"
            >
                <Text style={styles.textoBotao}>{carregando ? 'Salvando…' : 'Salvar medição'}</Text>
            </Pressable>
        </MainScreenLayout>
    );
}