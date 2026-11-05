import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const localDataStyles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: colors.background,
    },
    conteudo: {
        flexGrow: 1,
        paddingHorizontal: spacing.xxl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    titulo: {
        ...typography.title,
        color: colors.primaryDark,
        marginBottom: spacing.xs,
    },
    subtitulo: {
        ...typography.subtitle,
        color: colors.textSecondary,
        marginBottom: spacing.xl,
    },
    tituloSecao: {
        ...typography.label,
        color: colors.text,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    cartao: {
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    tituloCartao: {
        ...typography.label,
        color: colors.primaryDark,
    },
    texto: {
        ...typography.help,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    rotulo: {
        ...typography.label,
        color: colors.text,
        fontSize: 16,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    entrada: {
        minHeight: 54,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        ...typography.input,
        color: colors.textInput,
    },
    botao: {
        minHeight: 54,
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textoBotao: {
        ...typography.button,
        color: colors.white,
        fontSize: 18,
    },
    botaoSecundario: {
        minHeight: 48,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.md,
        borderWidth: 1,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    textoBotaoSecundario: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    erro: {
        ...typography.error,
        color: colors.error,
        marginTop: spacing.md,
    },
    textoVazio: {
        ...typography.help,
        color: colors.textHelp,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    chip: {
        flex: 1,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.xs,
    },
    chipSelecionado: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    textoChip: {
        color: colors.primary,
        fontWeight: '600',
    },
    textoChipSelecionado: {
        color: colors.white,
    },
    textoExcluir: {
        color: colors.error,
        fontWeight: '600',
        padding: spacing.sm,
    },
});
