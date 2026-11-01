import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { adicionarMedicao } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';

export default function PressaoScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [sistolica, setSistolica] = useState('');
    const [diastolica, setDiastolica] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function salvar() {
        setErro('');
        let sistolicaNumero = Number(sistolica);
        let diastolicaNumero = Number(diastolica);

        if (!sistolica.trim() || !diastolica.trim() || !Number.isFinite(sistolicaNumero) || !Number.isFinite(diastolicaNumero) || sistolicaNumero <= 0 || diastolicaNumero <= 0) {
            setErro('Informe valores válidos para as pressões máxima e mínima.');
            return;
        }

        if (sistolicaNumero < 30) sistolicaNumero *= 10;
        if (diastolicaNumero < 30) diastolicaNumero *= 10;

        setCarregando(true);
        try {
            await adicionarMedicao({
                id: Date.now().toString(),
                tipo: 'Pressão',
                valor: `${sistolicaNumero} / ${diastolicaNumero} mmHg`,
                data: new Date().toLocaleString('pt-BR'),
            });
            setSistolica('');
            setDiastolica('');
            navigation.navigate('Historico');
        } catch {
            setErro('Não foi possível salvar a medição neste aparelho.');
        } finally {
            setCarregando(false);
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
                onPress={salvar}
                disabled={carregando}
                accessibilityRole="button"
            >
                <Text style={styles.textoBotao}>{carregando ? 'Salvando…' : 'Salvar medição'}</Text>
            </Pressable>
        </MainScreenLayout>
    );
}


