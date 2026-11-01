import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { adicionarMedicao } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';

export default function GlicoseScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [valor, setValor] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    async function salvar() {
        setErro('');
        const numero = Number(valor.replace(',', '.'));
        if (!valor.trim() || !Number.isFinite(numero) || numero <= 0) {
            setErro('Informe um valor de glicose válido.');
            return;
        }

        setCarregando(true);
        try {
            await adicionarMedicao({
                id: Date.now().toString(),
                tipo: 'Glicose',
                valor: `${numero} mg/dL`,
                data: new Date().toLocaleString('pt-BR'),
            });
            setValor('');
            navigation.navigate('Historico');
        } catch {
            setErro('Não foi possível salvar a medição neste aparelho.');
        } finally {
            setCarregando(false);
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
                onPress={salvar}
                disabled={carregando}
                accessibilityRole="button"
            >
                <Text style={styles.textoBotao}>{carregando ? 'Salvando…' : 'Salvar medição'}</Text>
            </Pressable>
        </MainScreenLayout>
    );
}


