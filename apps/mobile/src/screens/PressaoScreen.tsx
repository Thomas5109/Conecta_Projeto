import { useCallback, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { Pressable, Text, TextInput, Alert } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import { lerUsuario } from '../services/storage/localData';
import { syncData } from '../services/sync';
import { salvarMedicaoPressao } from '../database/helpers/measurementRepository';
import AlertaRiscoModal from '../components/AlertaRiscoModal';

export default function PressaoScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [sistolica, setSistolica] = useState('');
    const [diastolica, setDiastolica] = useState('');
    const [idCliente, setIdCliente] = useState('local');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const [avisoRisco, setAvisoRisco] = useState({
        visivel: false,
        valorMedicao: '',
        sincronizado: false,
    });

    useFocusEffect(useCallback(() => {
        let ativo = true;
        void lerUsuario().then((usuario) => {
            if (ativo && usuario?.idCliente != null) {
                setIdCliente(String(usuario.idCliente));
            }
        });
        return () => { ativo = false; };
    }, []));

    async function registrarNoBancoOffline(sys: number, dia: number, isCritico: boolean) {
        setCarregando(true);
        try {
            await salvarMedicaoPressao(sys, dia, idCliente, isCritico);

            let sincronizado = false;
            try {
                sincronizado = await syncData();
            } catch (err) {
                console.log('Sync pendente (pressão):', err);
            }

            setSistolica('');
            setDiastolica('');

            if (isCritico) {
                setAvisoRisco({
                    visivel: true,
                    valorMedicao: `${sys}/${dia} mmHg`,
                    sincronizado,
                });
            } else {
                Alert.alert(
                    'Medição salva',
                    sincronizado
                        ? 'O registro foi salvo e sincronizado com a nuvem.'
                        : 'O registro foi guardado neste aparelho e está aguardando sincronização.',
                    [{ text: 'Ver histórico', onPress: () => navigation.navigate('Historico') }, { text: 'OK' }],
                );
            }
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
            Alert.alert(
                "Atenção: Crise Hipertensiva",
                `A medição de ${sistolicaNumero}/${diastolicaNumero} mmHg apresenta alto risco. Tem certeza que digitou corretamente?`,
                [
                    { text: "Não, vou corrigir", style: "cancel" },
                    { text: "Sim, salvar", style: "destructive", onPress: () => registrarNoBancoOffline(sistolicaNumero, diastolicaNumero, true) }
                ]
            );
        } else {
            registrarNoBancoOffline(sistolicaNumero, diastolicaNumero, false);
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Registrar pressão arterial</Text>
            <Text style={styles.subtitulo}>A medição ficará salva neste aparelho; a sincronização será indicada no histórico.</Text>

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

            <AlertaRiscoModal
                visivel={avisoRisco.visivel}
                tituloMedicao="Pressão arterial em nível crítico"
                valorMedicao={avisoRisco.valorMedicao}
                motivoRisco="Crise hipertensiva (pressão muito elevada)"
                sincronizado={avisoRisco.sincronizado}
                onFechar={() => setAvisoRisco((prev) => ({ ...prev, visivel: false }))}
                onVerHistorico={() => {
                    setAvisoRisco((prev) => ({ ...prev, visivel: false }));
                    navigation.navigate('Historico');
                }}
            />
        </MainScreenLayout>
    );
}