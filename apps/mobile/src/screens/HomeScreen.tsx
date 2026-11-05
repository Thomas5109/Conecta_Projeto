import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { lerUsuario } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import type { UsuarioLocal } from '../types/localData.types';

const atalhos = [
    { tela: 'Glicose', icone: '🩸', titulo: 'Glicose', descricao: 'Registrar medição diária' },
    { tela: 'Pressao', icone: '🫀', titulo: 'Pressão arterial', descricao: 'Registrar valores sistólico e diastólico' },
    { tela: 'Alarme', icone: '⏰', titulo: 'Lembretes', descricao: 'Organizar seus lembretes locais' },
    { tela: 'Contatos', icone: '📞', titulo: 'Contatos de emergência', descricao: 'Guardar e ligar para contatos úteis' },
    { tela: 'Dicas', icone: '💡', titulo: 'Dicas de cuidado', descricao: 'Consultar recomendações gerais' },
] as const;

export default function HomeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [usuario, setUsuario] = useState<UsuarioLocal | null>(null);

    useEffect(() => {
        let ativo = true;
        void lerUsuario().then((dados) => {
            if (ativo) setUsuario(dados);
        });
        return () => {
            ativo = false;
        };
    }, []);

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Olá{usuario?.nome ? `, ${usuario.nome}` : ''}!</Text>
            <Text style={styles.subtitulo}>O que deseja registrar ou consultar?</Text>

            <Text style={styles.tituloSecao}>Saúde e cuidados</Text>
            {atalhos.map((atalho) => (
                <Pressable
                    key={atalho.tela}
                    style={styles.cartao}
                    onPress={() => navigation.navigate(atalho.tela)}
                    accessibilityRole="button"
                >
                    <View style={styles.linha}>
                        <Text style={{ fontSize: 28 }}>{atalho.icone}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tituloCartao}>{atalho.titulo}</Text>
                            <Text style={styles.texto}>{atalho.descricao}</Text>
                        </View>
                    </View>
                </Pressable>
            ))}

            <Pressable
                style={styles.botaoSecundario}
                onPress={() => navigation.navigate('Historico')}
                accessibilityRole="button"
            >
                <Text style={styles.textoBotaoSecundario}>Ver histórico de medições</Text>
            </Pressable>
        </MainScreenLayout>
    );
}


