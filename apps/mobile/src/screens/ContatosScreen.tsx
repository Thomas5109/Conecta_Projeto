import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, TextInput, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { listarContatos, salvarContatos } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import type { ContatoLocal } from '../types/localData.types';

export default function ContatosScreen() {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [parentesco, setParentesco] = useState('');
    const [contatos, setContatos] = useState<ContatoLocal[]>([]);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;
        void listarContatos()
            .then((dados) => {
                if (ativo) setContatos(dados);
            })
            .catch(() => {
                if (ativo) setErro('Não foi possível carregar os contatos.');
            });
        return () => {
            ativo = false;
        };
    }, []);

    async function adicionar() {
        setErro('');
        if (!nome.trim() || !telefone.trim()) {
            setErro('Informe o nome e o telefone do contato.');
            return;
        }

        const atualizados = [
            ...contatos,
            {
                id: Date.now().toString(),
                nome: nome.trim(),
                telefone: telefone.trim(),
                parentesco: parentesco.trim() || 'Contato',
            },
        ];

        try {
            await salvarContatos(atualizados);
            setContatos(atualizados);
            setNome('');
            setTelefone('');
            setParentesco('');
        } catch {
            setErro('Não foi possível salvar o contato.');
        }
    }

    async function remover(id: string) {
        const atualizados = contatos.filter((contato) => contato.id !== id);
        try {
            await salvarContatos(atualizados);
            setContatos(atualizados);
        } catch {
            Alert.alert('Erro', 'Não foi possível remover o contato.');
        }
    }

    async function ligar(numero: string) {
        try {
            await Linking.openURL(`tel:${numero}`);
        } catch {
            Alert.alert('Erro', 'Não foi possível abrir o aplicativo de telefone.');
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Contatos de emergência</Text>
            <Text style={styles.subtitulo}>Contatos salvos somente neste aparelho.</Text>

            <Text style={styles.rotulo}>Nome do contato</Text>
            <TextInput style={styles.entrada} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor={colors.placeholder} />
            <Text style={styles.rotulo}>Telefone</Text>
            <TextInput style={styles.entrada} value={telefone} onChangeText={setTelefone} placeholder="DDD e número" placeholderTextColor={colors.placeholder} keyboardType="phone-pad" />
            <Text style={styles.rotulo}>Vínculo (opcional)</Text>
            <TextInput style={styles.entrada} value={parentesco} onChangeText={setParentesco} placeholder="Familiar, médico…" placeholderTextColor={colors.placeholder} />
            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            <Pressable style={styles.botao} onPress={adicionar} accessibilityRole="button">
                <Text style={styles.textoBotao}>Adicionar contato</Text>
            </Pressable>

            <Text style={styles.tituloSecao}>Lista de contatos</Text>
            {contatos.length === 0 ? (
                <Text style={styles.textoVazio}>Nenhum contato cadastrado.</Text>
            ) : (
                contatos.map((contato) => (
                    <View key={contato.id} style={styles.cartao}>
                        <Text style={styles.tituloCartao}>{contato.nome}</Text>
                        <Text style={styles.texto}>{contato.parentesco} · {contato.telefone}</Text>
                        <View style={styles.linha}>
                            <Pressable style={styles.botaoSecundario} onPress={() => void ligar(contato.telefone)} accessibilityRole="button">
                                <Text style={styles.textoBotaoSecundario}>Ligar</Text>
                            </Pressable>
                            <Pressable onPress={() => void remover(contato.id)} accessibilityRole="button">
                                <Text style={styles.textoExcluir}>Remover</Text>
                            </Pressable>
                        </View>
                    </View>
                ))
            )}
        </MainScreenLayout>
    );
}
