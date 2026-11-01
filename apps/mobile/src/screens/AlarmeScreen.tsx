import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import MainScreenLayout from '../components/MainScreenLayout';
import CampoDataHora from '../components/CampoDataHora';
import { normalizarHorario } from '../utils/dateTime';
import { listarLembretes, salvarLembretes } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import type { LembreteLocal } from '../types/localData.types';

export default function AlarmeScreen() {
    const [titulo, setTitulo] = useState('');
    const [horario, setHorario] = useState('');
    const [lembretes, setLembretes] = useState<LembreteLocal[]>([]);
    const [erro, setErro] = useState('');

    useEffect(() => {
        let ativo = true;
        void listarLembretes()
            .then((dados) => {
                if (ativo) setLembretes(dados);
            })
            .catch(() => {
                if (ativo) setErro('Não foi possível carregar os lembretes.');
            });
        return () => {
            ativo = false;
        };
    }, []);

    async function adicionar() {
        setErro('');
        const horarioNormalizado = normalizarHorario(horario);
        if (!titulo.trim() || !horarioNormalizado) {
            setErro('Informe uma descrição e um horário válido no formato HH:MM.');
            return;
        }

        const atualizados = [
            ...lembretes,
            {
                id: Date.now().toString(),
                titulo: titulo.trim(),
                horario: horarioNormalizado,
            },
        ];

        try {
            await salvarLembretes(atualizados);
            setLembretes(atualizados);
            setTitulo('');
            setHorario('');
        } catch {
            setErro('Não foi possível salvar o lembrete.');
        }
    }

    async function remover(id: string) {
        const atualizados = lembretes.filter((lembrete) => lembrete.id !== id);
        try {
            await salvarLembretes(atualizados);
            setLembretes(atualizados);
        } catch {
            Alert.alert('Erro', 'Não foi possível remover o lembrete.');
        }
    }

    return (
        <MainScreenLayout>
            <Text style={styles.titulo}>Lembretes</Text>
            <Text style={styles.subtitulo}>Os lembretes são guardados neste aparelho.</Text>

            <Text style={styles.rotulo}>O que deseja lembrar?</Text>
            <TextInput
                style={styles.entrada}
                placeholder="Ex.: tomar remédio"
                placeholderTextColor={colors.placeholder}
                value={titulo}
                onChangeText={setTitulo}
            />
            <Text style={styles.rotulo}>Horário (24 horas)</Text>
            <CampoDataHora
                mode="time"
                value={horario}
                onChangeText={setHorario}
                inputStyle={styles.entrada}
                placeholder="HH:MM"
                accessibilityLabel="Horário do lembrete"
            />
            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            <Pressable style={styles.botao} onPress={adicionar} accessibilityRole="button">
                <Text style={styles.textoBotao}>Salvar lembrete</Text>
            </Pressable>

            <Text style={styles.tituloSecao}>Seus lembretes</Text>
            {lembretes.length === 0 ? (
                <Text style={styles.textoVazio}>Nenhum lembrete cadastrado.</Text>
            ) : (
                lembretes.map((lembrete) => (
                    <View key={lembrete.id} style={[styles.cartao, styles.linha]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.tituloCartao}>
                                {normalizarHorario(lembrete.horario) ?? lembrete.horario}
                            </Text>
                            <Text style={styles.texto}>{lembrete.titulo}</Text>
                        </View>
                        <Pressable onPress={() => void remover(lembrete.id)} accessibilityRole="button">
                            <Text style={styles.textoExcluir}>Excluir</Text>
                        </Pressable>
                    </View>
                ))
            )}
        </MainScreenLayout>
    );
}
