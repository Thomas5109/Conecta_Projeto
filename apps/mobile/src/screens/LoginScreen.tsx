import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useLogin } from "../hooks/useLogin";
import { loginStyles as styles } from "../theme/loginStyles";
import { colors } from "../theme/colors";

import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const { email, setEmail, senha, setSenha, carregando, erro, handleLogin } =
    useLogin();
  const navigation = useNavigation();
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Bem-vindo!</Text>

          <Text style={styles.subtitulo}>
            Entre na sua conta para continuar.
          </Text>
        </View>

        <View style={styles.formulario}>
          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            accessibilityLabel="E-mail"
            editable={!carregando}
            returnKeyType="next"
          />

          <Text style={styles.label}>Senha</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor={colors.placeholder}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            accessibilityLabel="Senha"
            editable={!carregando}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {erro !== "" && (
            <Text style={styles.erro} accessibilityRole="alert">
              {erro}
            </Text>
          )}

          <Pressable
            style={[styles.botao, carregando && styles.botaoDesativado]}
            onPress={handleLogin}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Entrar na conta"
          >
            {carregando ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.textoBotao}>Entrar</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.botaoCadastro}
            onPress={() => navigation.navigate("Cadastro" as never)}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Criar uma nova conta"
          >
            <Text style={styles.textoBotaoCadastro}>Criar conta</Text>
          </Pressable>

          <Text style={styles.ajuda}>
            Digite o e-mail e a senha utilizados no cadastro.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
