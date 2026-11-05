import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const itens = [
    { tela: 'Inicio', icone: '🏠', rotulo: 'Início' },
    { tela: 'Historico', icone: '📊', rotulo: 'Histórico' },
    { tela: 'Alarme', icone: '⏰', rotulo: 'Lembretes' },
    { tela: 'Dicas', icone: '💡', rotulo: 'Dicas' },
    { tela: 'Perfil', icone: '👤', rotulo: 'Perfil' },
] as const;

export default function Rodape() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.rodape}>
            {itens.map((item) => (
                <Pressable
                    key={item.tela}
                    style={styles.item}
                    onPress={() => navigation.navigate(item.tela)}
                    accessibilityRole="button"
                    accessibilityLabel={item.rotulo}
                >
                    <Text style={styles.icone}>{item.icone}</Text>
                    <Text style={styles.rotulo}>{item.rotulo}</Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    rodape: {
        minHeight: 64,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: spacing.sm,
        paddingBottom: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.surface,
    },
    item: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 56,
    },
    icone: {
        fontSize: 19,
    },
    rotulo: {
        color: colors.primaryDark,
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
});




