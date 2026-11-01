import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { useEffect, useState } from 'react';
import { Alert, Pressable, Text } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { lerUsuario, removerUsuario } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import type { UsuarioLocal } from '../types/localData.types';

export default function PerfilScreen() {
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

    async function sair() {
        try {
            await removerUsuario();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch {
            Alert.alert('Erro', 'Não foi possível sair neste aparelho.');
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Meu perfil</Text>
            <Text style={styles.subtitulo}>Dados retornados pela API de login.</Text>
            <Text style={styles.rotulo}>Nome</Text>
            <Text style={styles.texto}>{usuario?.nome || 'Não informado'}</Text>
            <Text style={styles.rotulo}>E-mail</Text>
            <Text style={styles.texto}>{usuario?.email || 'Não informado'}</Text>
            <Text style={styles.rotulo}>Tipo de conta</Text>
            <Text style={styles.texto}>{usuario?.tipoUsuario || 'Não informado'}</Text>
            <Pressable style={styles.botao} onPress={sair} accessibilityRole="button">
                <Text style={styles.textoBotao}>Sair da conta neste aparelho</Text>
            </Pressable>
        </MainScreenLayout>
    );
}


