import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { listarMedicoes } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import type { MedicaoLocal } from '../types/localData.types';
import { formatarDataHoraExibicao } from '../utils/dateTime';

export default function HistoricoScreen() {
    const [medicoes, setMedicoes] = useState<MedicaoLocal[]>([]);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;
        void listarMedicoes()
            .then((dados) => {
                if (ativo) setMedicoes(dados);
            })
            .catch(() => {
                if (ativo) setErro('Não foi possível carregar o histórico.');
            });
        return () => {
            ativo = false;
        };
    }, []);

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Histórico de medições</Text>
            <Text style={styles.subtitulo}>Registros armazenados neste aparelho.</Text>
            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            {medicoes.length === 0 ? (
                <Text style={styles.textoVazio}>Nenhuma medição registrada ainda.</Text>
            ) : (
                medicoes.map((medicao) => (
                    <View key={medicao.id} style={styles.cartao}>
                        <Text style={styles.tituloCartao}>
                            {medicao.tipo === 'Glicose' ? '🩸 Glicose' : '🩺 Pressão arterial'}
                        </Text>
                        <Text style={styles.texto}>{medicao.valor}</Text>
                        <Text style={styles.texto}>{formatarDataHoraExibicao(medicao.data)}</Text>
                    </View>
                ))
            )}
        </MainScreenLayout>
    );
}

