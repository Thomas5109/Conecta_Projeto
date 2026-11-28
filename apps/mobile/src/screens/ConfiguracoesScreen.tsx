import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MainScreenLayout from '../components/MainScreenLayout';
import {
    lerPerfilReferenciaGlicose,
    lerUsuario,
    removerUsuario,
    salvarPerfilReferenciaGlicose,
} from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import type { PerfilReferenciaGlicose } from '../types/glicose.types';
import type { RootStackParamList } from '../types/navigation.types';
import type { UsuarioLocal } from '../types/localData.types';
import { PERFIS_REFERENCIA_GLICOSE } from '../utils/glicoseReference';

export default function ConfiguracoesScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [perfil, setPerfil] = useState<PerfilReferenciaGlicose | null>(null);
    const [usuario, setUsuario] = useState<UsuarioLocal | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvandoPerfil, setSalvandoPerfil] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;
        void Promise.all([lerPerfilReferenciaGlicose(), lerUsuario()])
            .then(([perfilSalvo, usuarioSalvo]) => {
                if (!ativo) return;
                setPerfil(perfilSalvo);
                setUsuario(usuarioSalvo);
            })
            .catch(() => {
                if (ativo) setErro('Não foi possível carregar as configurações.');
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });
        return () => { ativo = false; };
    }, []);

    async function selecionar(novoPerfil: PerfilReferenciaGlicose) {
        if (salvandoPerfil || novoPerfil === perfil) return;
        setErro('');
        setMensagem('');
        setSalvandoPerfil(true);
        try {
            await salvarPerfilReferenciaGlicose(novoPerfil);
            const valorSalvo = await lerPerfilReferenciaGlicose();
            if (valorSalvo !== novoPerfil) throw new Error('A preferência não foi confirmada no armazenamento.');
            setPerfil(valorSalvo);
            setMensagem('Preferência atualizada e salva neste aparelho.');
        } catch {
            setErro('Não foi possível salvar a preferência. Tente novamente.');
        } finally {
            setSalvandoPerfil(false);
        }
    }

    function confirmarSaida() {
        Alert.alert(
            'Sair da conta?',
            'Os dados salvos neste aparelho permanecerão disponíveis.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: () => {
                        void removerUsuario()
                            .then(() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }))
                            .catch(() => Alert.alert('Erro', 'Não foi possível sair neste aparelho.'));
                    },
                },
            ],
        );
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Configurações</Text>
            <Text style={styles.subtitulo}>Preferências do aplicativo e dados da sua conta.</Text>

            <Text style={styles.tituloSecao}>Perfil de referência da glicose</Text>
            <Text style={styles.texto}>Esse perfil é usado para comparar suas medições com as metas correspondentes.</Text>
            <View style={{ gap: 8, marginTop: 12 }}>
                {PERFIS_REFERENCIA_GLICOSE.map((opcao) => {
                    const selecionado = perfil === opcao.valor;
                    return (
                        <Pressable
                            key={opcao.valor}
                            style={[styles.botaoSecundario, selecionado && styles.chipSelecionado]}
                            onPress={() => void selecionar(opcao.valor)}
                            disabled={carregando || salvandoPerfil}
                            accessibilityRole="button"
                            accessibilityState={{ selected: selecionado, disabled: carregando || salvandoPerfil }}
                        >
                            <Text style={selecionado ? styles.textoOpcaoPerfilSelecionada : styles.textoOpcaoPerfil}>
                                {opcao.rotulo}{selecionado ? '  ✓' : ''}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
            {salvandoPerfil && <Text style={styles.texto}>Salvando preferência…</Text>}
            {mensagem !== '' && <Text style={styles.texto}>{mensagem}</Text>}
            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            {!perfil && !carregando && <Text style={styles.erro}>Selecione um perfil para habilitar a classificação de glicose.</Text>}

            <Text style={styles.tituloSecao}>Minha conta</Text>
            <View style={styles.cartao}>
                <Text style={styles.rotulo}>Nome</Text>
                <Text style={styles.texto}>{usuario?.nome || 'Não informado'}</Text>
                <Text style={styles.rotulo}>E-mail</Text>
                <Text style={styles.texto}>{usuario?.email || 'Não informado'}</Text>
                <Text style={styles.rotulo}>Tipo de conta</Text>
                <Text style={styles.texto}>{usuario?.tipoUsuario || 'Não informado'}</Text>
            </View>
            <Pressable style={[styles.botaoSecundario, { borderColor: '#B42318' }]} onPress={confirmarSaida} accessibilityRole="button">
                <Text style={styles.textoExcluir}>Sair da conta neste aparelho</Text>
            </Pressable>
        </MainScreenLayout>
    );
}
