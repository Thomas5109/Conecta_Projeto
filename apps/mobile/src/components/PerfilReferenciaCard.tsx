import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { localDataStyles as styles } from '../theme/localDataStyles';
import { colors } from '../theme/colors';
import { PERFIS_REFERENCIA_GLICOSE } from '../utils/glicoseReference';
import type { PerfilReferenciaGlicose } from '../types/glicose.types';

interface Props {
    perfil: PerfilReferenciaGlicose | null;
    onAlterar: () => void;
}

export default function PerfilReferenciaCard({ perfil, onAlterar }: Props) {
    const [aberto, setAberto] = useState(false);
    const rotulo = PERFIS_REFERENCIA_GLICOSE.find((item) => item.valor === perfil)?.rotulo
        ?? 'Nenhum perfil definido';

    return <>
        <Pressable style={[styles.cartao, { borderColor: colors.primary }]} onPress={() => setAberto(true)} accessibilityRole="button" accessibilityLabel={`Perfil de referência: ${rotulo}. Toque para ver opções.`}>
            <Text style={styles.tituloCartao}>Perfil de referência</Text>
            <Text style={styles.texto}>{rotulo}</Text>
            <Text style={[styles.texto, { color: colors.primary }]}>Toque para ver opções</Text>
        </Pressable>
        <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
            <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0008' }}>
                <View style={[styles.cartao, { backgroundColor: colors.surface }]}>
                    <Text style={styles.tituloCartao}>Perfil de referência</Text>
                    <Text style={styles.texto}>{rotulo}</Text>
                    <Pressable style={styles.botao} onPress={() => { setAberto(false); onAlterar(); }} accessibilityRole="button">
                        <Text style={styles.textoBotao}>Alterar</Text>
                    </Pressable>
                    <Pressable style={styles.botaoSecundario} onPress={() => setAberto(false)} accessibilityRole="button">
                        <Text style={styles.textoBotaoSecundario}>Fechar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    </>;
}
