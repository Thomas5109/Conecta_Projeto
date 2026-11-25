import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_TOKEN = '@alertasaude_token';

export async function lerToken(): Promise<string | null> {
    try {
        const conteudo = await AsyncStorage.getItem(CHAVE_TOKEN);
        return conteudo ? (JSON.parse(conteudo) as string) : null;
    } catch {
        return null;
    }
}

export function salvarToken(token: string): Promise<void> {
    return AsyncStorage.setItem(CHAVE_TOKEN, JSON.stringify(token));
}

export function removerToken(): Promise<void> {
    return AsyncStorage.removeItem(CHAVE_TOKEN);
}