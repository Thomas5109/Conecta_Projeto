import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/routes/AppNavigator';
import { useAutoSync } from './src/hooks/useAutoSync';

export default function App() {
    //useAutoSync();

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}