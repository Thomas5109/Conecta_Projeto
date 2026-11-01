import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const cadastroStyles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.screenVertical,
        backgroundColor: colors.background,
    },
    cabecalho: {
        marginBottom: spacing.xl,
    },
    titulo: {
        ...typography.title,
        color: colors.primaryDark,
        marginBottom: spacing.md,
    },
    subtitulo: {
        ...typography.subtitle,
        color: colors.textSecondary,
    },
    label: {
        ...typography.label,
        color: colors.text,
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
    },
    input: {
        minHeight: 58,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        ...typography.input,
        color: colors.textInput,
    },
    telefoneLinha: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: spacing.md,
    },
    telefoneDdd: {
        width: 96,
    },
    telefoneNumero: {
        flex: 1,
    },
    telefoneSubLabel: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    telefoneInput: {
        minHeight: 64,
        fontSize: 20,
    },
    ajudaTelefone: {
        ...typography.help,
        color: colors.textHelp,
        marginTop: spacing.sm,
    },
    opcoesSexo: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    opcaoSexo: {
        flex: 1,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.md,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.xs,
    },
    opcaoSexoSelecionada: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    textoOpcaoSexo: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    textoOpcaoSexoSelecionada: {
        color: colors.white,
    },
    erro: {
        marginTop: spacing.lg,
        ...typography.error,
        color: colors.error,
    },
    botao: {
        minHeight: 60,
        marginTop: spacing.xxxl,
        borderRadius: spacing.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoDesativado: {
        opacity: 0.7,
    },
    textoBotao: {
        ...typography.button,
        color: colors.white,
    },
});

