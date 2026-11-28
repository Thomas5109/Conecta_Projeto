import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface AlertaRiscoModalProps {
    visivel: boolean;
    tituloMedicao: string;
    valorMedicao: string;
    motivoRisco: string;
    sincronizado: boolean;
    onFechar: () => void;
    onVerHistorico: () => void;
}

export default function AlertaRiscoModal({
    visivel,
    tituloMedicao,
    valorMedicao,
    motivoRisco,
    sincronizado,
    onFechar,
    onVerHistorico,
}: AlertaRiscoModalProps) {
    return (
        <Modal
            visible={visivel}
            animationType="slide"
            transparent={false}
            onRequestClose={onFechar}
        >
            <View style={styles.container}>
                <View style={styles.conteudo}>
                    <View style={styles.badge}>
                        <Text style={styles.textoBadge}>ATENÇÃO: RISCO À SAÚDE</Text>
                    </View>

                    <Text style={styles.titulo}>{tituloMedicao}</Text>
                    <Text style={styles.valor}>{valorMedicao}</Text>
                    <Text style={styles.motivo}>{motivoRisco}</Text>

                    <View style={styles.cartaoOrientacao}>
                        <Text style={styles.tituloOrientacao}>Procure assistência médica</Text>
                        <Text style={styles.textoOrientacao}>
                            Esta medição está fora dos limites seguros. Entre em contato com um
                            profissional de saúde, procure o atendimento médico mais próximo ou
                            ligue para a emergência se sentir sintomas.
                        </Text>
                    </View>

                    <Text style={styles.statusSync}>
                        {sincronizado
                            ? 'Registro salvo no aparelho e sincronizado com a nuvem.'
                            : 'Registro salvo neste aparelho (aguardando sincronização).'}
                    </Text>
                </View>

                <View style={styles.rodape}>
                    <Pressable
                        style={styles.botaoEmergencia}
                        onPress={() => void Linking.openURL('tel:192')}
                        accessibilityRole="button"
                    >
                        <Text style={styles.textoBotaoEmergencia}>Ligar para o SAMU (192)</Text>
                    </Pressable>

                    <Pressable
                        style={styles.botaoPrincipal}
                        onPress={onVerHistorico}
                        accessibilityRole="button"
                    >
                        <Text style={styles.textoBotaoPrincipal}>Entendi, ver histórico</Text>
                    </Pressable>

                    <Pressable
                        style={styles.botaoSecundario}
                        onPress={onFechar}
                        accessibilityRole="button"
                    >
                        <Text style={styles.textoBotaoSecundario}>Fechar aviso</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#B91C1C',
        paddingHorizontal: 24,
        paddingVertical: 36,
        justifyContent: 'space-between',
    },
    conteudo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#7F1D1D',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 20,
    },
    textoBadge: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    titulo: {
        color: '#FEE2E2',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    valor: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '800',
        textAlign: 'center',
        marginVertical: 8,
    },
    motivo: {
        color: '#FECACA',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 24,
    },
    cartaoOrientacao: {
        backgroundColor: '#991B1B',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: 16,
        padding: 20,
        width: '100%',
    },
    tituloOrientacao: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
    },
    textoOrientacao: {
        color: '#FEF2F2',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    statusSync: {
        color: '#FECACA',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 16,
    },
    rodape: {
        gap: 12,
    },
    botaoEmergencia: {
        backgroundColor: '#7F1D1D',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        minHeight: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoBotaoEmergencia: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    botaoPrincipal: {
        backgroundColor: '#FFFFFF',
        minHeight: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoBotaoPrincipal: {
        color: '#991B1B',
        fontSize: 18,
        fontWeight: '800',
    },
    botaoSecundario: {
        minHeight: 46,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoBotaoSecundario: {
        color: '#FEE2E2',
        fontSize: 16,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});