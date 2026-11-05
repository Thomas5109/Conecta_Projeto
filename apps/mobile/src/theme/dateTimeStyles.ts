import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

export const dateTimeStyles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: spacing.sm,
    },
    entrada: {
        flex: 1,
    },
    botaoSeletor: {
        width: 58,
        minHeight: 54,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
    },
    botaoDesativado: {
        opacity: 0.6,
    },
    iconeSeletor: {
        fontSize: 25,
    },
    painelSeletor: {
        marginTop: spacing.sm,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
    },
    acoesSeletor: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    botaoAcao: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        borderRadius: spacing.sm,
    },
    botaoConfirmar: {
        backgroundColor: colors.primary,
    },
    textoBotaoAcao: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 16,
    },
    textoConfirmar: {
        color: colors.white,
    },
    ajudaFormato: {
        marginTop: spacing.xs,
        color: colors.error,
        fontSize: 14,
    },
});
