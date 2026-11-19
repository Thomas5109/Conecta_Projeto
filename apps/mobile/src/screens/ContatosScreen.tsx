import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, TextInput, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import { listarContatos, salvarContatos } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import type { ContatoLocal } from '../types/localData.types';
import { formatarDdd, formatarNumeroTelefone, formatarTelefoneCompleto } from '../utils/phone';

export default function ContatosScreen() {
    const [nome, setNome] = useState('');
    const [ddd, setDdd] = useState('');
    const [numeroTelefone, setNumeroTelefone] = useState('');
    const [parentesco, setParentesco] = useState('');
    const [contatos, setContatos] = useState<ContatoLocal[]>([]);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');

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
        setMensagem('');
        if (!nome.trim() || ddd.replace(/\D/g, '').length !== 2 || ![8, 9].includes(numeroTelefone.replace(/\D/g, '').length)) {
            setErro('Informe o nome, o DDD com 2 números e um telefone válido.');
            return;
        }

        const atualizados = [
            ...contatos,
            {
                id: Date.now().toString(),
                nome: nome.trim(),
                telefone: formatarTelefoneCompleto(ddd, numeroTelefone),
                parentesco: parentesco.trim() || 'Contato',
            },
        ];

        try {
            await salvarContatos(atualizados);
            setContatos(atualizados);
            setNome('');
            setDdd('');
            setNumeroTelefone('');
            setParentesco('');
            setMensagem('Contato salvo neste aparelho.');
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
            await Linking.openURL(`tel:${numero.replace(/\D/g, '')}`);
        } catch {
            Alert.alert('Erro', 'Não foi possível abrir o aplicativo de telefone.');
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Contatos de emergência</Text>
            <Text style={styles.subtitulo}>Contatos salvos somente neste aparelho.</Text>

            <Text style={styles.rotulo}>Nome do contato <Text style={styles.obrigatorioBadge}>  OBRIGATÓRIO  </Text></Text>
            <TextInput style={[styles.entrada, styles.inputObrigatorio]} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor={colors.placeholder} />
            <Text style={styles.rotulo}>Telefone <Text style={styles.obrigatorioBadge}>  OBRIGATÓRIO  </Text></Text>
            <View style={styles.telefoneLinha}>
                <View style={styles.telefoneDdd}>
                    <Text style={styles.telefoneSubLabel}>DDD</Text>
                    <TextInput style={[styles.entrada, styles.inputObrigatorio, styles.telefoneInput]} value={ddd} onChangeText={(valor) => setDdd(formatarDdd(valor))} placeholder="65" placeholderTextColor={colors.placeholder} keyboardType="number-pad" maxLength={2} accessibilityLabel="DDD do telefone de emergência" />
                </View>
                <View style={styles.telefoneNumero}>
                    <Text style={styles.telefoneSubLabel}>Número do telefone</Text>
                    <TextInput style={[styles.entrada, styles.inputObrigatorio, styles.telefoneInput]} value={numeroTelefone} onChangeText={(valor) => setNumeroTelefone(formatarNumeroTelefone(valor))} placeholder="9 1234-5678" placeholderTextColor={colors.placeholder} keyboardType="phone-pad" maxLength={12} accessibilityLabel="Número do telefone sem DDD" />
                </View>
            </View>
            <Text style={styles.rotulo}>Vínculo (opcional)</Text>
            <TextInput style={styles.entrada} value={parentesco} onChangeText={setParentesco} placeholder="Familiar, médico…" placeholderTextColor={colors.placeholder} />
            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            {mensagem !== '' && <Text style={styles.texto} accessibilityRole="status">{mensagem}</Text>}
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
