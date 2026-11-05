import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation.types';
import AlarmeScreen from '../screens/AlarmeScreen';
import CadastroScreen from '../screens/CadastroScreen';
import ContatosScreen from '../screens/ContatosScreen';
import DicasScreen from '../screens/DicasScreen';
import GlicoseScreen from '../screens/GlicoseScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PressaoScreen from '../screens/PressaoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: true, title: 'Criar conta' }} />
            <Stack.Screen name="Inicio" component={HomeScreen} />
            <Stack.Screen name="Glicose" component={GlicoseScreen} />
            <Stack.Screen name="Pressao" component={PressaoScreen} />
            <Stack.Screen name="Historico" component={HistoricoScreen} />
            <Stack.Screen name="Alarme" component={AlarmeScreen} />
            <Stack.Screen name="Contatos" component={ContatosScreen} />
            <Stack.Screen name="Dicas" component={DicasScreen} />
            <Stack.Screen name="Perfil" component={PerfilScreen} />
        </Stack.Navigator>
    );
}

