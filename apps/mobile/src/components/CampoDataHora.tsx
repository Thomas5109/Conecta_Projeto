import { useState } from 'react';
import {
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
    type StyleProp,
    type TextStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { dateTimeStyles as styles } from '../theme/dateTimeStyles';
import {
    dataBrasileiraParaISO,
    formatarDataBrasileira,
    formatarHorario,
    horarioParaDate,
    mascararDataBrasileira,
    mascararHorario,
    parseDataBrasileira,
} from '../utils/dateTime';

type ModoCampo = 'date' | 'time';

interface CampoDataHoraProps {
    mode: ModoCampo;
    value: string;
    onChangeText: (valor: string) => void;
    inputStyle?: StyleProp<TextStyle>;
    placeholder?: string;
    accessibilityLabel: string;
    maximumDate?: Date;
    disabled?: boolean;
    onBlur?: () => void;
}

function obterDataInicial(mode: ModoCampo, value: string): Date {
    if (mode === 'date') {
        return parseDataBrasileira(value) ?? new Date();
    }

    return horarioParaDate(value) ?? new Date();
}

function formatarValor(mode: ModoCampo, value: Date): string {
    return mode === 'date' ? formatarDataBrasileira(value) : formatarHorario(value);
}

export default function CampoDataHora({
    mode,
    value,
    onChangeText,
    inputStyle,
    placeholder,
    accessibilityLabel,
    maximumDate,
    disabled = false,
    onBlur,
}: CampoDataHoraProps) {
    const [aberto, setAberto] = useState(false);
    const [rascunho, setRascunho] = useState(() => obterDataInicial(mode, value));
    const podeAbrirSeletor = Platform.OS !== 'web';

    function abrirSeletor() {
        setRascunho(obterDataInicial(mode, value));
        setAberto(true);
    }

    function alterarValor(_: unknown, dataSelecionada: Date) {
        setRascunho(dataSelecionada);
        if (Platform.OS === 'android') {
            onChangeText(formatarValor(mode, dataSelecionada));
            setAberto(false);
        }
    }

    function confirmarSelecao() {
        onChangeText(formatarValor(mode, rascunho));
        setAberto(false);
    }

    function alterarTexto(texto: string) {
        onChangeText(mode === 'date' ? mascararDataBrasileira(texto) : mascararHorario(texto));
    }

    const valorValido = mode === 'date'
        ? dataBrasileiraParaISO(value) !== null
        : horarioParaDate(value) !== null;
    const valorCompleto = mode === 'date'
        ? value.length === 10
        : value.includes(':') && value.split(':')[1]?.length === 2;

    return (
        <View>
            <View style={styles.linha}>
                <TextInput
                    style={[styles.entrada, inputStyle]}
                    value={value}
                    onChangeText={alterarTexto}
                    placeholder={placeholder ?? (mode === 'date' ? 'DD/MM/AAAA' : 'HH:MM')}
                    keyboardType={mode === 'date' ? 'numeric' : 'numbers-and-punctuation'}
                    maxLength={mode === 'date' ? 10 : 5}
                    editable={!disabled}
                    accessibilityLabel={accessibilityLabel}
                    accessibilityHint={mode === 'date'
                        ? 'Digite no formato dia, mês e ano'
                        : 'Digite no formato de 24 horas'}
                    onBlur={onBlur}
                />
                {podeAbrirSeletor && (
                    <Pressable
                        style={[styles.botaoSeletor, disabled && styles.botaoDesativado]}
                        onPress={abrirSeletor}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityLabel={mode === 'date' ? 'Abrir calendário' : 'Abrir relógio'}
                    >
                        <Text style={styles.iconeSeletor}>{mode === 'date' ? '📅' : '🕒'}</Text>
                    </Pressable>
                )}
            </View>

            {aberto && Platform.OS === 'android' && (
                <DateTimePicker
                    mode={mode}
                    value={obterDataInicial(mode, value)}
                    display={mode === 'date' ? 'calendar' : 'clock'}
                    maximumDate={mode === 'date' ? maximumDate : undefined}
                    is24Hour
                    firstDayOfWeek={1}
                    onValueChange={alterarValor}
                    onDismiss={() => setAberto(false)}
                />
            )}

            {aberto && Platform.OS === 'ios' && (
                <View style={styles.painelSeletor}>
                    <DateTimePicker
                        mode={mode}
                        value={rascunho}
                        display="spinner"
                        maximumDate={mode === 'date' ? maximumDate : undefined}
                        locale="pt_BR"
                        is24Hour
                        onValueChange={alterarValor}
                    />
                    <View style={styles.acoesSeletor}>
                        <Pressable
                            style={styles.botaoAcao}
                            onPress={() => setAberto(false)}
                            accessibilityRole="button"
                        >
                            <Text style={styles.textoBotaoAcao}>Cancelar</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.botaoAcao, styles.botaoConfirmar]}
                            onPress={confirmarSelecao}
                            accessibilityRole="button"
                        >
                            <Text style={[styles.textoBotaoAcao, styles.textoConfirmar]}>
                                Usar {mode === 'date' ? 'data' : 'horário'}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {!valorValido && valorCompleto && (
                <Text style={styles.ajudaFormato}>
                    {mode === 'date' ? 'Use o formato DD/MM/AAAA.' : 'Use o formato HH:MM.'}
                </Text>
            )}
        </View>
    );
}

