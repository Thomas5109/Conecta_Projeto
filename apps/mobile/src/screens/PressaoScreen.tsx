import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useState } from 'react';
import { Pressable, Text, TextInput, Alert } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';

// Importa a nova função do repositório WatermelonDB
import { salvarMedicaoPressao } from '../database/helpers/measurementRepository';

export default function PressaoScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [sistolica, setSistolica] = useState('');
    const [diastolica, setDiastolica] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    // TODO: Substituir pelo ID real do usuário logado vindo do Contexto de Autenticação
    const ID_CLIENTE_LOGADO = 'id-mock-do-usuario';

    async function registrarNoBancoOffline(sys: number, dia: number) {
        setCarregando(true);
        try {
            // Salva no WatermelonDB, gera UUID, Payload FHIR e status 'PENDENTE'
            await salvarMedicaoPressao(sys, dia, ID_CLIENTE_LOGADO);
            
            setSistolica('');
            setDiastolica('');
            navigation.navigate('Historico');
        } catch {
            setErro('Não foi possível salvar a medição no banco local.');
        } finally {
            setCarregando(false);
        }
    }

    function processarMedicao() {
        setErro('');
        let sistolicaNumero = Number(sistolica);
        let diastolicaNumero = Number(diastolica);

        if (!sistolica.trim() || !diastolica.trim() || !Number.isFinite(sistolicaNumero) || !Number.isFinite(diastolicaNumero) || sistolicaNumero <= 0 || diastolicaNumero <= 0) {
            setErro('Informe valores válidos para as pressões máxima e mínima.');
            return;
        }

        if (sistolicaNumero < 30) sistolicaNumero *= 10;
        if (diastolicaNumero < 30) diastolicaNumero *= 10;

        // Validação Clínica Local (Regra de Negócio Offline)
        // Crise hipertensiva: Sistólica >= 180 ou Diastólica >= 120
        const isCritico = sistolicaNumero >= 180 || diastolicaNumero >= 120;

        if (isCritico) {
            // Tela de Double Check (Confirmação)
            Alert.alert(
                "Atenção: Crise Hipertensiva",
                `A medição de ${sistolicaNumero}/${diastolicaNumero} mmHg apresenta alto risco. Tem certeza que digitou corretamente?`,
                [
                    { text: "Não, vou corrigir", style: "cancel" },
                    { text: "Sim, salvar", style: "destructive", onPress: () => registrarNoBancoOffline(sistolicaNumero, diastolicaNumero) }
                ]
            );
        } else {
            // Valor normal ou alteração leve, salva direto
            registrarNoBancoOffline(sistolicaNumero, diastolicaNumero);
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Registrar pressão arterial</Text>
            <Text style={styles.subtitulo}>A medição ficará salva neste aparelho.</Text>

            <Text style={styles.rotulo}>Pressão sistólica (máxima)</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Ex.: 120"
                placeholderTextColor={colors.placeholder}
                value={sistolica}
                onChangeText={setSistolica}
                keyboardType="numeric"
                editable={!carregando}
            />

            <Text style={styles.rotulo}>Pressão diastólica (mínima)</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Ex.: 80"
                placeholderTextColor={colors.placeholder}
                value={diastolica}
                onChangeText={setDiastolica}
                keyboardType="numeric"
                editable={!carregando}
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