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
    cartaoAcaoPrincipal: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primarySoftBorder,
        borderWidth: 1.5,
    },
    tituloAcaoPrincipal: {
        color: colors.primaryDark,
        fontSize: 19,
    },
    textoAcaoPrincipal: {
        color: colors.textSecondary,
    },
    cartaoAlertaMeta: {
        backgroundColor: colors.errorSurface,
        borderColor: colors.error,
    },
    tituloCartao: {
        ...typography.label,
        color: colors.primaryDark,
    },
    tituloMetaAlta: {
        color: colors.error,
    },
    badgeRisco: {
        alignSelf: 'flex-start',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: spacing.md,
        borderWidth: 1,
        borderColor: colors.error,
        backgroundColor: colors.errorSurface,
    },
    textoBadgeRisco: {
        color: colors.error,
        fontSize: 14,
        fontWeight: '800',
    },
    textoOpcaoPerfil: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    textoOpcaoPerfilSelecionada: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    valorMedicao: {
        color: colors.primaryDark,
        fontSize: 28,
        fontWeight: '800',
        marginTop: spacing.sm,
    },
    unidadeMedicao: {
        color: colors.textSecondary,
        fontSize: 20,
        fontWeight: '700',
    },
    faixaCartao: {
        borderColor: colors.requiredBorder,
        backgroundColor: colors.requiredSurface,
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
    inputObrigatorio: {
        borderColor: colors.requiredBorder,
        borderWidth: 1.5,
    },
    obrigatorioBadge: {
        color: colors.required,
        backgroundColor: colors.requiredSurface,
        fontSize: 11,
        fontWeight: '800',
        overflow: 'hidden',
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
    telefoneInput: {
        minHeight: 64,
        fontSize: 20,
    },
    telefoneSubLabel: {
        color: colors.text,
        fontSize: 17,
        fontWeight: '700',
        marginBottom: spacing.sm,
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
