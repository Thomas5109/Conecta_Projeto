import { StyleSheet } from "react-native";

import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.screenVertical,
  },

  cabecalho: {
    marginBottom: spacing.huge,
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

  formulario: {
    width: "100%",
  },

  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.md - 2,
    marginTop: spacing.lg + 2,
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

  botao: {
    minHeight: 60,
    marginTop: spacing.xxxl,
    borderRadius: spacing.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoDesativado: {
    opacity: 0.7,
  },

  textoBotao: {
    ...typography.button,
    color: colors.white,
  },

  erro: {
    marginTop: spacing.lg,
    ...typography.error,
    color: colors.error,
  },

  ajuda: {
    marginTop: spacing.xl,
    ...typography.help,
    textAlign: "center",
    color: colors.textHelp,
  },
  botaoCadastro: {
    minHeight: 56,
    marginTop: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  textoBotaoCadastro: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
});
