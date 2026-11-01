import { Text, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import dicas from '../../../../data/local-storage/dicas.json';
import { localDataStyles as styles } from '../theme/localDataStyles';

export default function DicasScreen() {
    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Dicas de cuidado</Text>
            <Text style={styles.subtitulo}>
                Conteúdo editável em data/local-storage/dicas.json.
            </Text>
            {dicas.map((dica) => (
                <View key={dica.id} style={styles.cartao}>
                    <Text style={styles.tituloCartao}>
                        {dica.icone} {dica.titulo}
                    </Text>
                    <Text style={styles.texto}>{dica.descricao}</Text>
                </View>
            ))}
        </MainScreenLayout>
    );
}
