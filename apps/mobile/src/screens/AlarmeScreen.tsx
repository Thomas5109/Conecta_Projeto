import { useEffect, useState } from 'react';
import { Alert, Keyboard, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MainScreenLayout from '../components/MainScreenLayout';
import { formatarHorario, horarioParaDate, normalizarHorario } from '../utils/dateTime';
import { listarLembretes, salvarLembretes } from '../services/storage/localData';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import type { LembreteLocal } from '../types/localData.types';

export default function AlarmeScreen() {
    const [titulo, setTitulo] = useState('');
    const [hora, setHora] = useState('');
    const [minutos, setMinutos] = useState('');
    const [lembretes, setLembretes] = useState<LembreteLocal[]>([]);
    const [erro, setErro] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [relogioAberto, setRelogioAberto] = useState(false);
    const [horarioRelogio, setHorarioRelogio] = useState(new Date());
    let campoMinutos: { focus: () => void } | null = null;

    function normalizarCampo(valor: string, limite: number): string | null {
        const digitos = valor.replace(/\D/g, '').slice(0, 2);
        if (!digitos) return null;
        const numero = Number(digitos);
        return numero <= limite ? String(numero).padStart(2, '0') : null;
    }

    function abrirRelogio() {
        const horarioAtual = hora && minutos ? horarioParaDate(`${hora}:${minutos}`) : null;
        setHorarioRelogio(horarioAtual ?? new Date());
        setRelogioAberto(true);
    }

    function aplicarHorarioRelogio(data: Date) {
        const horarioFormatado = formatarHorario(data);
        const [horaFormatada, minutosFormatados] = horarioFormatado.split(':');
        setHora(horaFormatada);
        setMinutos(minutosFormatados);
        setErro('');
        setRelogioAberto(false);
    }

    function alterarRelogio(_: unknown, dataSelecionada?: Date) {
        if (!dataSelecionada) {
            if (Platform.OS === 'android') setRelogioAberto(false);
            return;
        }
        setHorarioRelogio(dataSelecionada);
        if (Platform.OS === 'android') aplicarHorarioRelogio(dataSelecionada);
    }

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
        if (salvando) return;
        Keyboard.dismiss();
        setErro('');
        setMensagem('');
        const horaNormalizada = normalizarCampo(hora, 23);
        const minutosNormalizados = normalizarCampo(minutos, 59);
        const horarioNormalizado = horaNormalizada && minutosNormalizados
            ? normalizarHorario(`${horaNormalizada}:${minutosNormalizados}`)
            : null;
        if (!titulo.trim() || !horarioNormalizado) {
            setErro('Informe uma descrição e uma hora válida: horas de 00 a 23 e minutos de 00 a 59.');
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

        setSalvando(true);
        try {
            await salvarLembretes(atualizados);
            setLembretes(atualizados);
            setTitulo('');
            setHora('');
            setMinutos('');
            setMensagem('Lembrete salvo neste aparelho.');
        } catch {
            setErro('Não foi possível salvar o lembrete.');
        } finally {
            setSalvando(false);
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
            <View style={[styles.linha, { justifyContent: 'flex-start', alignItems: 'flex-end', gap: 8 }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.telefoneSubLabel}>Hora</Text>
                    <TextInput
                        style={[styles.entrada, { fontSize: 22, textAlign: 'center', letterSpacing: 2 }]}
                        value={hora}
                        onChangeText={(valor) => setHora(valor.replace(/\D/g, '').slice(0, 2))}
                        onBlur={() => { const valor = normalizarCampo(hora, 23); if (valor) setHora(valor); }}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="HH"
                        placeholderTextColor={colors.placeholder}
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => campoMinutos?.focus()}
                        accessibilityLabel="Hora do lembrete, de 00 a 23"
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.telefoneSubLabel}>Minutos</Text>
                    <TextInput
                        ref={(campo) => { campoMinutos = campo; }}
                        style={[styles.entrada, { fontSize: 22, textAlign: 'center', letterSpacing: 2 }]}
                        value={minutos}
                        onChangeText={(valor) => setMinutos(valor.replace(/\D/g, '').slice(0, 2))}
                        onBlur={() => { const valor = normalizarCampo(minutos, 59); if (valor) setMinutos(valor); }}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="MM"
                        placeholderTextColor={colors.placeholder}
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        accessibilityLabel="Minutos do lembrete, de 00 a 59"
                    />
                </View>
                <Pressable
                    style={[styles.botaoSecundario, { width: 52, height: 54, minHeight: 54, marginTop: 0, paddingHorizontal: 0, alignItems: 'center', justifyContent: 'center' }]}
                    onPress={abrirRelogio}
                    accessibilityRole="button"
                    accessibilityLabel="Escolher horário usando o relógio"
                >
                    <Text style={{ fontSize: 23 }}>🕒</Text>
                </Pressable>
            </View>
            {relogioAberto && Platform.OS === 'android' && (
                <DateTimePicker
                    mode="time"
                    value={horarioRelogio}
                    display="clock"
                    is24Hour
                    onValueChange={alterarRelogio}
                    onDismiss={() => setRelogioAberto(false)}
                />
            )}
            <Modal
                visible={relogioAberto && Platform.OS === 'ios'}
                transparent
                animationType="fade"
                onRequestClose={() => setRelogioAberto(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008' }}>
                    <View style={{ borderRadius: 16, padding: 18, backgroundColor: colors.surface }}>
                        <Text style={styles.tituloCartao}>Escolha o horário</Text>
                        <DateTimePicker
                            mode="time"
                            value={horarioRelogio}
                            display="spinner"
                            locale="pt_BR"
                            is24Hour
                            onValueChange={alterarRelogio}
                        />
                        <View style={styles.linha}>
                            <Pressable style={styles.botaoSecundario} onPress={() => setRelogioAberto(false)} accessibilityRole="button">
                                <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
                            </Pressable>
                            <Pressable style={styles.botao} onPress={() => aplicarHorarioRelogio(horarioRelogio)} accessibilityRole="button">
                                <Text style={styles.textoBotao}>Usar horário</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
            {erro !== '' && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
            {mensagem !== '' && <Text style={styles.texto}>{mensagem}</Text>}
            <Pressable style={[styles.botao, salvando && { opacity: 0.7 }]} onPress={() => void adicionar()} disabled={salvando} accessibilityRole="button">
                <Text style={styles.textoBotao}>{salvando ? 'Salvando…' : 'Salvar lembrete'}</Text>
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
